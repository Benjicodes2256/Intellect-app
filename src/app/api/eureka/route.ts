import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Initialize bare Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// USE EDGE RUNTIME TO BYPASS 10-SECOND VERCEL NODE TIMEOUT
export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { debateId, closingUserId } = body;

        if (!debateId || !closingUserId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // We use the Service Role key here because the request is coming from our own server action
        // in the background without an active user session token context in the edge function.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        console.log(`[EUREKA] Starting AI Summarization for debate: ${debateId}`);

        // 1. Fetch debate topic
        const { data: debate, error: debateError } = await supabase.from('debates').select('*').eq('id', debateId).single()
        if (debateError || !debate) {
            console.error(`[EUREKA] Debate fetch failed:`, debateError);
            return NextResponse.json({ error: "Failed to fetch debate" }, { status: 500 });
        }

        // 2. Verify Authorization
        if (debate.creator_id !== closingUserId) {
            const { data: userData } = await supabase.from("users").select("role").eq("clerk_id", closingUserId).single()
            if (userData?.role !== 'admin') {
                return NextResponse.json({ error: "Unauthorized: Only the creator can close this debate." }, { status: 403 });
            }
        }

        // 3. Fetch comments with user relations
        const { data: comments, error: commentsError } = await supabase.from('comments').select('*, users(clerk_username)').eq('debate_id', debateId).order('created_at', { ascending: true })
        if (commentsError) {
            console.error(`[EUREKA] Comments fetch failed:`, commentsError);
            return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
        }

        let summaryText = ""

        if (!comments || comments.length === 0) {
            summaryText = "This debate was closed before any arguments were made."
        } else if (!process.env.GEMINI_API_KEY) {
            summaryText = "Eureka logged out for the day, Eureka will be back tomorrow"
        } else {
            console.log(`[EUREKA] Found ${comments.length} comments. Sending to Gemini...`);

            const transcript = comments.map((c: any) => `[${c.stance.toUpperCase()}] ${c.users?.clerk_username || 'Participant'}: ${c.content}`).join('\n')
            const prompt = `
            You are Eureka, the AI Moderator. A debate has just concluded.
            Topic: "${debate.topic}"
            
            Transcript of Arguments:
            ${transcript}
            
            Task: Write a highly structured, 2-3 paragraph closing summary of the debate. 
            Highlight the strongest points made by both the FOR and AGAINST sides. 
            Declare the overarching consensus or the most logical conclusion based solely on the provided transcript.
            Format it in clean markdown.
            `

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                })
                summaryText = response.text || "Eureka logged out for the day, Eureka will be back tomorrow"
                console.log(`[EUREKA] Successfully generated Summary.`);
            } catch (apiError) {
                console.error("[EUREKA] Rate Limit / API Error:", apiError)
                summaryText = "Eureka logged out for the day, Eureka will be back tomorrow"
            }
        }

        console.log(`[EUREKA] Inserting posts to database (Author: ${closingUserId})...`);

        // 3. Insert the summary as a public feed post flagged as AI
        const { error: insertError } = await supabase.from('posts').insert({
            author_id: closingUserId,
            content: `**[Debate Concluded: ${debate.topic}]**\n\n${summaryText}`,
            is_eureka_summary: true
        })

        if (insertError) {
            console.error("[EUREKA] Failed to insert feed post:", insertError)
            return NextResponse.json({ error: "DB Feed Post Insert Failed" }, { status: 500 });
        }

        // 4. Insert the summary as a comment in the debate thread
        const { error: commentInsertError } = await supabase.from('comments').insert({
            debate_id: debateId,
            author_id: closingUserId,
            content: `**[Eureka AI Summary]**\n${summaryText}`,
            stance: 'neutral',
        })

        if (commentInsertError) {
            console.error("[EUREKA] Failed to insert debate comment:", commentInsertError)
            return NextResponse.json({ error: "DB Comment Insert Failed" }, { status: 500 });
        }

        // 5. Officially mark the debate as closed now that the AI Summary is posted
        const { error: lockError } = await supabase
            .from('debates')
            .update({ is_closed: true })
            .eq('id', debateId)

        if (lockError) {
            console.error("[EUREKA] Failed to lock debate:", lockError)
            return NextResponse.json({ error: "Failed to cleanly lock debate" }, { status: 500 });
        }

        console.log(`[EUREKA] Finished successfully! Debate ${debateId} locked.`);
        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("[EUREKA] Fatal Error:", e)
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
