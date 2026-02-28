import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// Ensure we don't break the build if the API key is missing locally.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' })

export async function POST(req: Request) {
    try {
        const { comment, topic } = await req.json()

        if (!comment || !topic) {
            return NextResponse.json({ error: 'Missing comment or topic' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Skipping actual AI evaluation.")
            return NextResponse.json({
                is_vulgar: false,
                is_fluff: false,
                points: 0,
                message: "AI skipped (No API key)",
            })
        }

        const prompt = `
    You are Eureka, the AI Moderator of iNTELlect, a platform for high-signal debates.
    Topic: "${topic}"
    Comment to evaluate: "${comment}"

    Task:
    1. Check for Profanity/Vulgarity. Respond with "is_vulgar: true" if any.
    2. Check the "Logic Point" Rule. Is this just fluff (e.g., "I agree", "great post") with no added value? Respond with "is_fluff: true" if so.
    3. Evaluate if it contains a verifiable fact-check with logic/source. If it aggressively tears down a flaw with logic or adds great value, award "points: [1-5]". Usually 0.

    Respond ONLY in strict JSON format:
    {
      "is_vulgar": boolean,
      "is_fluff": boolean,
      "points": number
    }
    `

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        })

        const text = response.text || "{}"
        const result = JSON.parse(text)

        return NextResponse.json({
            is_vulgar: result.is_vulgar || false,
            is_fluff: result.is_fluff || false,
            points: result.points || 0,
        })

    } catch (error: any) {
        console.error("Eureka AI Error:", error)
        // Graceful degradation: If rate limits hit, don't crash the comment submission.
        return NextResponse.json({
            is_vulgar: false,
            is_fluff: false,
            points: 0,
            error: "Rate limit or processing error - bypassed."
        }, { status: 200 }) // Return 200 so the client accepts it and posts the comment anyway
    }
}
