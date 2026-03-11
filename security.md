# 🔒 SECURITY.md — Security Prompting Playbook

> Every security measure in this project, written as reusable prompts and checklists.  
> Copy these into any Lovable project to harden it in one pass.

---

## Why This Document Exists

Security is often an afterthought — bolted on after the first breach scare. This document captures the **exact prompts** used to harden this app so you (or anyone) can apply the same checks to future projects systematically.

Every section follows this structure:
1. **The Risk** — what can go wrong
2. **The Prompt** — what you tell the AI to fix it
3. **The Pattern** — how it was implemented in this codebase

---

## 1. Generic Error Messages

### The Risk
Detailed error messages leak database schema, column names, query structure, and stack traces to attackers. A message like `"column 'password_hash' does not exist"` tells them your table structure.

### The Prompt
> "Make sure ALL edge functions return generic error messages to the client. Log the real error server-side with `console.error`. Never expose stack traces, database errors, column names, or query details to the frontend."

### The Pattern
```typescript
// ❌ BAD — leaks internals
catch (err) {
  return new Response(JSON.stringify({ error: err.message }), { status: 500 });
}

// ✅ GOOD — generic to client, detailed to server
catch (err) {
  const error = err as Error;
  console.error("admin-auth error:", error.message);
  return new Response(
    JSON.stringify({ error: "An internal error occurred" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

**Applied in:** `admin-auth`, `admin-api`, `send-magic-link`, `validate-magic-link`, `sync-sheet-data`

---

## 2. CORS Headers

### The Risk
Missing or incomplete CORS headers cause edge functions to silently fail from browser clients. Missing headers on error responses mean errors are swallowed — the frontend gets a CORS error instead of the actual error.

### The Prompt
> "Add CORS headers to ALL edge functions. Include the full `Access-Control-Allow-Headers` list with Supabase-specific headers (`x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`). Handle OPTIONS preflight. Include CORS headers on EVERY response — including errors."

### The Pattern
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Preflight handler — MUST be first
if (req.method === "OPTIONS") {
  return new Response(null, { headers: corsHeaders });
}

// Every response (including errors) includes CORS headers
return new Response(JSON.stringify({ error: "..." }), {
  status: 500,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
```

**Checklist:**
- [ ] Every edge function has `corsHeaders` defined
- [ ] Every function handles `OPTIONS` preflight
- [ ] Every `new Response()` (success AND error) spreads `...corsHeaders`
- [ ] Headers include all Supabase client-specific headers

---

## 3. Email Enumeration Prevention

### The Risk
If your login/magic-link endpoint returns different responses for "email exists" vs "email not found", attackers can probe your user database to build a list of valid emails.

### The Prompt
> "When sending magic links or OTPs, return `{ success: true }` even if the email doesn't exist in the system. Don't reveal whether an email is registered."

### The Pattern
```typescript
// In send-magic-link edge function:
const { data: registration } = await supabase
  .from("registrations")
  .select("id")
  .eq("email", email.trim().toLowerCase())
  .single();

// Email not found? Still return success — don't reveal it
if (!registration) {
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

**Also applies to:** Registration duplicate detection — error code `23505` (unique violation) returns a generic "Something went wrong" instead of "This email is already registered."

---

## 4. Input Validation (Server-Side)

### The Risk
Client-side validation can be bypassed with curl or Postman. Every input must be validated server-side before touching the database.

### The Prompt
> "Validate ALL inputs server-side in every edge function: UUID format for IDs, email format and length, OTP format (4 digits only). Reject anything that doesn't match before querying the database."

### The Pattern
```typescript
// UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(token)) {
  return new Response(JSON.stringify({ status: "invalid" }), { status: 200, ... });
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email) || email.length > 255) {
  return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, ... });
}

// OTP validation (4 digits)
if (!/^\d{4}$/.test(otp)) {
  return new Response(JSON.stringify({ status: "invalid" }), { status: 200, ... });
}
```

**Validation checklist for every endpoint:**
- [ ] Email: format regex + max 255 chars + `.trim().toLowerCase()`
- [ ] UUIDs: full regex validation before database lookup
- [ ] OTPs/codes: exact format check (length, character set)
- [ ] Free-text fields: length limits
- [ ] No raw user input passed directly to queries

---

## 5. Rate Limiting

### The Risk
Without rate limiting, attackers can brute-force OTPs, spam your email-sending endpoint (costing money), or DDoS your functions.

### The Prompt
> "Add rate limiting to the magic link / OTP sending. Don't let a user request a new code more than once every 2 minutes. For bulk operations, add delays between individual sends to prevent overwhelming downstream services."

### The Pattern
```typescript
// Check if an OTP was already sent recently (within last 2 minutes)
if (registration.magic_token_expires_at) {
  const expiresAt = new Date(registration.magic_token_expires_at);
  const sentAt = new Date(expiresAt.getTime() - 10 * 60 * 1000); // Token lives 10min
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  
  if (sentAt > twoMinutesAgo) {
    return new Response(
      JSON.stringify({ success: true }), // Don't reveal rate limiting details
      { status: 200, ... }
    );
  }
}

// For bulk sends — throttle with delays
for (const user of users) {
  await sendEmail(user);
  await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between sends
}
```

---

## 6. Token & Session Expiry

### The Risk
Tokens that never expire mean a leaked token grants permanent access. Stale sessions accumulate as attack surface.

### The Prompt
> "Set expiry times on all tokens: OTPs expire after 10 minutes, admin sessions after 7 days, user cookies after 30 days. Check expiry server-side — never trust client-side clocks."

### The Pattern
| Token Type | Expiry | Where Checked |
|---|---|---|
| OTP (magic_token) | 10 minutes | Edge function (server) |
| Admin session | 7 days | Edge function (server) |
| User cookie (hpm_user) | 30 days | Client-side (cookie maxAge) |

```typescript
// Server-side expiry check
if (registration.magic_token_expires_at && 
    new Date(registration.magic_token_expires_at) < new Date()) {
  return new Response(JSON.stringify({ status: "expired" }), ...);
}
```

---

## 7. Password Hashing

### The Risk
Plaintext or weakly hashed passwords mean a database breach exposes all admin credentials.

### The Prompt
> "Hash admin passwords with PBKDF2 using 100,000 iterations, SHA-256, and a random 16-byte salt. Store as `salt:hash` format. Never store plaintext passwords."

### The Pattern
```typescript
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  // Store as "saltHex:hashHex"
  return `${toHex(salt)}:${toHex(new Uint8Array(bits))}`;
}
```

**Why PBKDF2?** It works on Deno Deploy (edge functions) where bcrypt doesn't. 100K iterations makes brute-force impractical.

---

## 8. API Key Protection

### The Risk
Exposed API keys allow unauthorized access to admin functions, data sync, and bulk operations.

### The Prompt
> "Protect all admin and sync endpoints with API keys. The sync endpoint should require `HELLOPM_API_KEY`. The admin seed action should require `ADMIN_SEED_KEY`. Never expose the service role key to the client."

### The Pattern
```typescript
// API key validation in sync-sheet-data
const apiKey = req.headers.get("x-api-key") 
  || req.headers.get("authorization")?.replace("Bearer ", "") 
  || url.searchParams.get("key");
const expectedKey = Deno.env.get("HELLOPM_API_KEY");

if (!apiKey || apiKey !== expectedKey) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, ... });
}
```

**Key isolation rules:**
- `SUPABASE_SERVICE_ROLE_KEY` — only in edge functions (server-side), NEVER in client code
- `SUPABASE_ANON_KEY` — safe for client-side (publishable)
- Custom API keys — stored as secrets, accessed via `Deno.env.get()`

---

## 9. Session Token Management (Resilient Validation)

### The Risk
Aggressive token clearing on network errors causes users to get logged out during temporary connectivity issues.

### The Prompt
> "Only clear the admin session token when the server explicitly returns `valid: false`. On network errors or transient failures, keep the token — report invalid for this check but don't destroy the session."

### The Pattern
```typescript
// In validateAdminSession():
if (res.data && res.data.valid === false) {
  clearAdminToken();       // Server said "definitely invalid" → clear
  return { valid: false };
}
if (res.error || !res.data?.valid) {
  return { valid: false }; // Transient error → DON'T clear token
}
```

**Why this matters:** Mobile users on flaky connections would get randomly logged out without this pattern.

---

## 10. Client-Side Error Handling

### The Risk
Showing raw database errors to users leaks schema information. Showing "email already exists" confirms account existence.

### The Prompt
> "Show generic error messages to users. Handle duplicate email errors (Postgres code 23505) gracefully without revealing that the email is already registered. Never show raw error objects in the UI."

### The Pattern
```typescript
// In registration form:
catch (err: any) {
  if (err?.code === "23505") {
    toast.error("Something went wrong. Please try again.");
    // NOT: "This email is already registered"
  } else {
    toast.error("Something went wrong. Please try again later.");
  }
}
```

---

## 11. One-Time Token Use

### The Risk
If OTP tokens aren't cleared after validation, they can be replayed — the same code grants access multiple times.

### The Prompt
> "After a successful OTP validation, immediately set the token to null in the database. Each token should work exactly once."

### The Pattern
```typescript
// After successful OTP match:
await supabase
  .from("registrations")
  .update({ magic_token: null, magic_token_expires_at: null })
  .eq("id", registration.id);

return new Response(JSON.stringify({ status: "valid", registrationId: registration.id }), ...);
```

---

## 12. Credential Stuffing Defense

### The Risk
If "wrong email" and "wrong password" return different error messages, attackers can first enumerate valid emails, then brute-force passwords.

### The Prompt
> "Return the exact same error message — 'Invalid credentials' — for both wrong email AND wrong password on admin login. Make the responses identical (same status code, same message, same timing)."

### The Pattern
```typescript
// Wrong email:
if (error || !admin) {
  return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, ... });
}

// Wrong password (same exact response):
if (!passwordValid) {
  return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, ... });
}
```

---

## 13. Service Role Key Isolation

### The Risk
The service role key bypasses all RLS policies. If it leaks to the client, anyone can read/write/delete all data.

### The Prompt
> "Never use the service role key in client-side code. Only use it in edge functions. The client should only ever have the anon/publishable key."

### The Pattern
```
Client-side (browser):     SUPABASE_ANON_KEY (publishable, safe)
Edge functions (server):   SUPABASE_SERVICE_ROLE_KEY (secret, bypasses RLS)
```

**Verification:** Search your entire frontend codebase for `SERVICE_ROLE` — it should return zero results.

---

## 14. Row Level Security (RLS)

### The Risk
Without RLS, anyone with the anon key can read/write any row in any table. RLS is your last line of defense.

### The Prompt
> "Enable RLS on all tables. Public-facing tables (exhibitors, speakers, sessions) should allow read-only access for everyone. User-specific tables should restrict access to the owning user. Admin tables should block all direct access — admin operations go through edge functions using the service role key."

### The Pattern
| Table | RLS Policy |
|---|---|
| `exhibitors`, `speakers`, `sessions` | SELECT for everyone, no INSERT/UPDATE/DELETE |
| `registrations` | Access through edge functions only (service role) |
| `admin_users` | No public access — all operations via edge functions |
| `whatsapp_groups` | SELECT for everyone |

---

## 15. No Debug Logs in Production

### The Risk
`console.log` statements in production edge functions can leak sensitive data (tokens, passwords, user data) to log aggregation services.

### The Prompt
> "Remove ALL `console.log` debug statements from production edge functions. Only keep `console.error` for actual errors. Never log tokens, passwords, email addresses, or user data."

### The Pattern
```typescript
// ❌ BAD — logs sensitive data
console.log("User login attempt:", email, password);
console.log("Token generated:", token);

// ✅ GOOD — only log errors, no sensitive data
console.error("admin-auth error:", error.message);
```

---

## 🚀 Reusable Security Prompt Templates

Copy-paste these into any new project to harden it:

### One-Shot Hardening Prompt
> "Audit ALL edge functions for security. Ensure: (1) generic error messages to clients, real errors logged server-side, (2) CORS headers on every response including errors, (3) OPTIONS preflight handling, (4) input validation for emails, UUIDs, and codes, (5) no service role key in client code, (6) rate limiting on email/OTP sends, (7) tokens expire and are cleared after one use, (8) identical error messages for wrong email vs wrong password, (9) no console.log in production, (10) RLS enabled on all tables."

### Per-Feature Prompts
| When building... | Use this prompt |
|---|---|
| **Login/Auth** | "Return identical error messages for wrong email and wrong password. Don't reveal whether an email exists. Hash passwords with PBKDF2 100K iterations." |
| **Magic Links/OTP** | "Tokens expire after 10 minutes. Clear token after one use. Rate limit sends to once per 2 minutes. Return success even if email not found." |
| **Admin Panel** | "Admin operations go through edge functions only. Use service role key server-side. Session tokens are UUIDs, expire after 7 days, cleared on logout." |
| **API Endpoints** | "Require API key via header or query param. Validate against env var. Return 401 for missing/wrong keys." |
| **Data Sync** | "Add delays between bulk operations. Validate all incoming data. Log sync errors server-side only." |
| **New Database Table** | "Enable RLS. Add appropriate policies. Public tables get SELECT only. User tables restrict by user_id." |
| **Forms** | "Validate client-side AND server-side. Show generic errors to users. Handle constraint violations (23505) without revealing details." |

---

## ✅ Pre-Launch Security Audit Checklist

Run through this before every deployment:

### Edge Functions
- [ ] Every function returns generic errors to clients
- [ ] Every function has CORS headers on ALL responses (including errors)
- [ ] Every function handles OPTIONS preflight
- [ ] No `console.log` — only `console.error` for actual errors
- [ ] No sensitive data in log messages (no tokens, passwords, emails)
- [ ] Service role key only used server-side

### Authentication
- [ ] Login returns identical errors for wrong email vs wrong password
- [ ] OTP/magic tokens expire (10 min)
- [ ] Tokens cleared after successful use (one-time)
- [ ] Rate limiting on OTP/email sends
- [ ] Passwords hashed (PBKDF2, bcrypt, or argon2 — never plaintext)
- [ ] Session tokens have expiry dates
- [ ] Token validation is resilient (don't clear on network errors)

### Database
- [ ] RLS enabled on ALL tables
- [ ] Public tables: SELECT only
- [ ] User tables: restricted by user_id
- [ ] Admin tables: no direct public access
- [ ] No sensitive data in publicly accessible columns

### Client-Side
- [ ] No service role key in frontend code
- [ ] Generic error messages shown to users
- [ ] Duplicate detection doesn't reveal account existence
- [ ] All inputs validated before submission
- [ ] No sensitive data in console logs

### API Keys & Secrets
- [ ] All private keys stored as secrets (not in code)
- [ ] API endpoints require authentication
- [ ] Seed/setup endpoints require separate admin keys
- [ ] Publishable keys clearly identified and safe to expose

---

## ❌ Common Mistakes to Avoid

| Mistake | Why It's Bad | What To Do Instead |
|---|---|---|
| `return new Response(JSON.stringify({ error: err.message }))` | Leaks internals | Return generic message, log real error |
| Different messages for "user not found" vs "wrong password" | Enables email enumeration | Identical "Invalid credentials" for both |
| `console.log("token:", token)` in production | Tokens leak to logs | Remove all debug logs |
| Service role key in `.env` used by frontend | Bypasses all RLS | Only use in edge functions |
| No CORS on error responses | Frontend can't read the error | Spread `...corsHeaders` on EVERY response |
| OTP token not cleared after use | Replay attacks | Set to `null` immediately after validation |
| No rate limiting on email sends | Attackers can spam your email quota | Throttle to once per 2 minutes per user |
| RLS disabled "for testing" and forgotten | Anyone can read/write everything | Enable RLS immediately, create policies |
| `magic_token` stored as plaintext in DB | If DB leaks, all tokens are usable | Clear after use + short expiry mitigates |
| Trusting client-side validation alone | Bypassed with curl/Postman | Always validate server-side |

---

*Last updated: February 2026*  
*Project: HelloPM AI Impact Summit*
