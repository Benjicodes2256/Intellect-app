import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// USE EDGE RUNTIME TO BYPASS 10-SECOND VERCEL NODE TIMEOUT
export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic, context } = body;

        if (!topic) {
            return NextResponse.json({ error: "Missing debate topic" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service unavailable (API Key Missing)" }, { status: 503 });
        }

        // Initialize SDK inside handler for Edge runtime reliability
        const ai = new GoogleGenAI({ apiKey });

        // §4 — sanitise inputs
        const sanitisedTopic = String(topic).slice(0, 300);
        const sanitisedContext = context ? String(context).slice(0, 1000) : null;

        const prompt = `
        You are Eureka, a strictly neutral AI Moderator for a debate platform. 
        A user is creating a new debate. You must write an impartial introductory prompt to set the stage for participants.
        
        Topic: "${sanitisedTopic}"
        Context/Sources Provided by User: 
        ${sanitisedContext ? `"${sanitisedContext}"` : "None provided. Rely purely on the debate topic."}
        
        Task: Write a strictly neutral debate introduction following "Smart Brevity" rules.
        
        Rules:
        1. Keep it under 100 words.
        2. Be Punchy: Use short sentences and simple, accessible language. Zero academic jargon or fluff.
        3. Be Visual: Use bold text to highlight the core tensions.
        4. Be Neutral: You must perfectly balance the prompt so participants can argue both sides equally. Do NOT conclude the debate or offer a solution. Strictly present the central conflict.
        5. Tone: You are writing this text on behalf of the User who is hosting the debate. DO NOT introduce yourself as Eureka. Just jump straight into the context.

        Formatting Rules:
        - Use standard English punctuation.
        - DO NOT use excessive Markdown flourishes like "***" or "...".
        - Use standard sizing for all text. No large headers (#). 
        - Use bold text for main section headings, e.g. **The Core Conflict**.
        - Use italic text for subheadings or emphasis, e.g. *Why it matters*.
        - Use simple bullet points (-) for lists.
        `;

        const response = await ai.models.generateContent({
            model: 'models/gemini-flash-latest',
            contents: prompt,
        });

        const rawIntro = response.text || "";

        // Strip markdown noise (horizontal rules, code blocks, excessive stars)
        const cleanIntro = rawIntro
            .replace(/^[`\s]*|[`\s]*$/g, '') // Strip wrapping backticks
            .replace(/^markdown\n/i, '')     // Strip "markdown" language tag
            .replace(/\*\*\*+/g, '')         // Strip *** horizontal rules
            .replace(/---+/g, '')           // Strip --- horizontal rules
            .replace(/___+/g, '')           // Strip ___ horizontal rules
            .trim();

        if (!cleanIntro) {
            console.error("[EUREKA INTRO] Empty response from Gemini");
            return NextResponse.json({ error: "Eureka failed to generate an introduction." }, { status: 500 });
        }

        return NextResponse.json({ intro: cleanIntro });

    } catch (e: any) {
        console.error("[EUREKA INTRO] Fatal Error:", e?.message || e);
        // Temporarily return specific details to help debug why it's failing
        return NextResponse.json({ 
            error: "An internal error occurred",
            details: e?.message || String(e)
        }, { status: 500 });
    }
}
