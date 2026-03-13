import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const runtime = 'edge';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { debateId, closingUserId } = body;

        // §4 — Input validation: reject malformed IDs before touching the DB
        if (!debateId || !closingUserId) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        if (!UUID_REGEX.test(debateId)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // Fetch debate
        const { data: debate, error: debateError } = await supabase
            .from('debates').select('*').eq('id', debateId).single();

        if (debateError || !debate) {
            return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
        }

        // §5 — Rate limiting: reject if debate is already closed (prevents Gemini spam)
        if (debate.is_closed) {
            return NextResponse.json({ error: "Debate is already closed" }, { status: 409 });
        }

        // Verify authorisation
        if (debate.creator_id !== closingUserId) {
            const { data: userData } = await supabase
                .from("users").select("role").eq("clerk_id", closingUserId).single();
            if (userData?.role !== 'admin') {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        }

        // Fetch comments
        const { data: comments, error: commentsError } = await supabase
            .from('comments').select('*, users(clerk_username)')
            .eq('debate_id', debateId).order('created_at', { ascending: true });

        if (commentsError) {
            console.error(`[EUREKA] Comments fetch failed:`, commentsError);
            return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
        }

        let summaryText = "";

        if (!comments || comments.length === 0) {
            summaryText = "This debate was closed before any arguments were made.";
        } else if (!process.env.GEMINI_API_KEY) {
            summaryText = "Eureka could not generate a summary at this time. Please try again later.";
        } else {
            const transcript = comments
                .map((c: any) => `[${c.stance.toUpperCase()}] ${c.users?.clerk_username || 'Participant'}: ${c.content}`)
                .join('\n');

            const prompt = `
            You are Eureka, the AI Moderator. A debate has just concluded.
            Topic: "${debate.topic}"
            
            Transcript of Arguments:
            ${transcript}
            
            Task: Write a final summary of the debate following strict "Smart Brevity" rules:
            1. Be Punchy: Use short sentences and simple, accessible language. Zero academic jargon or fluff.
            2. Be Visual: Use bold text to highlight key concepts, and use bullet points for the main arguments.
            3. Structure: 
               - Start with a strong 1-sentence TL;DR of what happened.
               - List 1-2 bullet points for the strongest FOR argument.
               - List 1-2 bullet points for the strongest AGAINST argument.
               - Conclude with a final 1-sentence verdict on the overarching logical consensus.
            
            Critical Judging Rules:
            1. DO NOT judge based on the number of arguments. Judge strictly on logical merit.
            2. DO NOT give advice on how arguments could be improved.
            3. Base conclusions exclusively on the arguments posted.
            
            Formatting Rules:
            - Use standard English punctuation.
            - DO NOT use excessive Markdown flourishes like "***" or "...".
            - Use standard sizing for all text. No large headers (#). 
            - Use bold text for main section headings, e.g. **The Verdict**.
            - Use italic text for subheadings or emphasis.
            - Use simple bullet points (-) for lists.
            `;

            try {
                const response = await ai.models.generateContent({
                    model: 'models/gemini-1.5-flash',
                    contents: prompt,
                });
                const raw = response.text?.trim() || '';
                if (raw.length < 50) {
                    summaryText = "Eureka attempted to summarise this debate but received an incomplete response. The debate has been closed.";
                } else {
                    summaryText = raw;
                }
            } catch (apiError: any) {
                console.error("[EUREKA] Gemini API Error:", apiError?.message);
                summaryText = "Eureka could not generate a summary at this time. The debate has been closed.";
            }
        }

        // Insert feed post ONLY if debate is public
        if (!debate.is_private) {
            const { error: insertError } = await supabase.from('posts').insert({
                author_id: closingUserId,
                content: `**Debate Concluded — ${debate.topic}**\n\n${summaryText}`,
                is_eureka_summary: true
            });

            if (insertError) {
                console.error("[EUREKA] Feed post insert failed:", insertError.message);
                return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
            }
        }

        // Insert debate thread comment
        const { error: commentInsertError } = await supabase.from('comments').insert({
            debate_id: debateId,
            author_id: closingUserId,
            content: `**[Eureka AI Summary]**\n${summaryText}`,
            stance: 'neutral',
        });

        if (commentInsertError) {
            console.error("[EUREKA] Comment insert failed:", commentInsertError.message);
            return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
        }

        // Lock debate
        const { error: lockError } = await supabase
            .from('debates').update({ is_closed: true }).eq('id', debateId);

        if (lockError) {
            console.error("[EUREKA] Debate lock failed:", lockError.message);
            return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("[EUREKA] Fatal Error:", e?.message);
        return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
    }
}
