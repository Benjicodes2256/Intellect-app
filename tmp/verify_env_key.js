const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

async function verify() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/GEMINI_API_KEY=([^\s]+)/);
        if (!match) {
            console.log("Key not found in .env.local");
            return;
        }
        const key = match[1];
        console.log("Verifying key (truncated):", key.slice(0, 10) + "...");
        
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
            model: 'models/gemini-flash-latest',
            contents: 'hi',
        });
        console.log("✅ Success! Key is valid.");
    } catch (e) {
        console.error("❌ Key verification FAILED:", e.message);
    }
}

verify();
