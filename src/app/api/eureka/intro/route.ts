import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize bare Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// USE EDGE RUNTIME TO BYPASS 10-SECOND VERCEL NODE TIMEOUT
export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic, context } = body;

        if (!topic) {
            return NextResponse.json({ error: "Missing debate topic" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Eureka API Key is missing. Cannot generate introduction." }, { status: 500 });
        }

        console.log(`[EUREKA INTRO] Generating introduction for topic: ${topic}`);

        const prompt = `
        You are Eureka, a strictly neutral AI Moderator for a debate platform. 
        A user is creating a new debate. You must write an impartial introductory prompt to set the stage for participants.
        
        Topic: "${topic}"
        Context/Sources Provided by User: 
        ${context ? `"${context}"` : "None provided. Rely purely on the debate topic."}
        
        Task: Write a strictly neutral debate introduction following "Smart Brevity" rules.
        
        Rules:
        1. Keep it under 100 words.
        2. Be Punchy: Use short sentences and simple, accessible language. Zero academic jargon or fluff.
        3. Be Visual: Use bold text to highlight the core tensions.
        4. Be Neutral: You must perfectly balance the prompt so participants can argue both sides equally. Do NOT conclude the debate or offer a solution. Strictly present the central conflict.

        Formatting Rules:
        - Use standard English punctuation.
        - DO NOT use excessive Markdown flourishes like "***" or "...".
        - Use standard sizing for all text. No large headers (#). 
        - Use bold text for main section headings, e.g. **The Core Conflict**.
        - Use italic text for subheadings or emphasis, e.g. *Why it matters*.
        - Use simple bullet points (-) for lists.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const generatedIntro = response.text || "";

        if (!generatedIntro) {
            return NextResponse.json({ error: "Eureka failed to generate an introduction." }, { status: 500 });
        }

        return NextResponse.json({ intro: generatedIntro });

    } catch (e: any) {
        console.error("[EUREKA INTRO] Fatal Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
