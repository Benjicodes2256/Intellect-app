-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- Create Users Table
create table public.users (
  clerk_id text primary key,
  clerk_username text,
  email text,
  reputation_score integer default 0,
  truth_score integer default 100,
  agreed_to_charter boolean default false,
  role text default 'user', -- 'admin' for adminme
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Posts Table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id text references public.users(clerk_id) on delete cascade not null,
  content text not null,
  is_eureka_summary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Debates Table
create table public.debates (
  id uuid default uuid_generate_v4() primary key,
  creator_id text references public.users(clerk_id) on delete cascade not null,
  topic text not null,
  introduction text,
  rating integer default 0,
  duration_days integer not null, -- 1, 2, or 5
  closes_at timestamp with time zone not null,
  is_closed boolean default false,
  eureka_for_score integer default 0,
  eureka_against_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Comments Table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  author_id text references public.users(clerk_id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade,
  debate_id uuid references public.debates(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  stance text check (stance in ('for', 'against', 'neutral')),
  is_fluff boolean default false,
  is_vulgar boolean default false,
  points_awarded integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure it belongs to either a post or a debate
  constraint comment_target_check check ((post_id is not null and debate_id is null) or (post_id is null and debate_id is not null))
);

-- Create Likes Table
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.users(clerk_id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, post_id),
  unique (user_id, comment_id),
  constraint like_target_check check ((post_id is not null and comment_id is null) or (post_id is null and comment_id is not null))
);

-- Create Messages Table (Inbox)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id text references public.users(clerk_id) on delete cascade not null,
  receiver_id text references public.users(clerk_id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Suggestions Table
create table public.suggestions (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.users(clerk_id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) configuration
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.debates enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.messages enable row level security;
alter table public.suggestions enable row level security;

-- Create function to get current clerk user id properly from the JWT claim
create or replace function public.clerk_user_id() returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ language sql stable;

-- Utility function to check if current user is admin
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.users where clerk_id = public.clerk_user_id() and role = 'admin'
  );
$$ language sql security definer;

-- Policies for public.users
create policy "Users can view their own profile or all profiles" on public.users
  for select using (true);
create policy "Users can update their own profile" on public.users
  for update using (public.clerk_user_id() = clerk_id)
  with check (public.clerk_user_id() = clerk_id);

-- Policies for public.posts
create policy "Anyone can view posts" on public.posts for select using (true);
create policy "Authenticated users can create posts" on public.posts 
  for insert with check (public.clerk_user_id() = author_id);
create policy "Authors can delete their own posts, Admins can delete any" on public.posts
  for delete using ((public.clerk_user_id() = author_id) or public.is_admin());

-- Policies for public.debates
create policy "Anyone can view debates" on public.debates for select using (true);
create policy "Authenticated users can create debates" on public.debates
  for insert with check (public.clerk_user_id() = creator_id);
create policy "Admins can delete any debate" on public.debates
  for delete using (public.is_admin());
create policy "Creators can delete their own debates" on public.debates
  for delete using (public.clerk_user_id() = creator_id);
create policy "Creators can update their own debates" on public.debates
  for update using (public.clerk_user_id() = creator_id)
  with check (public.clerk_user_id() = creator_id);

-- Policies for public.comments
create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Authenticated users can create comments" on public.comments
  for insert with check (public.clerk_user_id() = author_id);
create policy "Authors can delete their own unlocked comments, Admins can delete any" on public.comments
  for delete using (
    ((public.clerk_user_id() = author_id) and not exists(select 1 from public.debates d where d.id = debate_id and d.is_closed = true))
    or public.is_admin()
  );

-- Policies for public.likes
create policy "Anyone can view likes" on public.likes for select using (true);
create policy "Authenticated users can like/unlike" on public.likes
  for all using (public.clerk_user_id() = user_id)
  with check (public.clerk_user_id() = user_id);

-- Policies for public.messages
create policy "Users can view their own incoming and outgoing messages" on public.messages
  for select using (public.clerk_user_id() = sender_id or public.clerk_user_id() = receiver_id);
create policy "Authenticated users can send messages" on public.messages
  for insert with check (public.clerk_user_id() = sender_id);
create policy "Users can delete messages in their inbox" on public.messages
  for delete using (public.clerk_user_id() = sender_id or public.clerk_user_id() = receiver_id);

-- Policies for public.suggestions
create policy "Users can view their own suggestions, Admins can view all" on public.suggestions
  for select using ((public.clerk_user_id() = user_id) or public.is_admin());
create policy "Authenticated users can submit suggestions" on public.suggestions
  for insert with check (public.clerk_user_id() = user_id);

-- Create Admin user bypassing auth (assuming Adminme is known or will sign up)
-- We will handle admin claim mapping in clerk webhook or update role manually first time
