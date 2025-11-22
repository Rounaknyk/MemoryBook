import { GoogleGenerativeAI } from '@google/generative-ai';
import { Memory } from '@/types/memory';

export async function generateNostalgicMessage(
    onThisDay: Memory[],
    lastMonth: Memory[],
    lastMonthWeek: Memory[]
): Promise<string> {
    console.log('Checking Gemini API Key...');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('Gemini API Key is missing in process.env');
        return "Here's a blast from the past!";
    }
    console.log('Gemini API Key found. Generating message...');

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const formatMemories = (mems: Memory[], label: string) => {
            if (mems.length === 0) return '';
            return `${label}:\n` + mems.map(m =>
                `- [${m.date}] ${m.title}: ${m.caption} (${m.notes.join(', ')})`
            ).join('\n');
        };

        const descriptions = [
            formatMemories(onThisDay, "ON THIS DAY (Previous Years)"),
            formatMemories(lastMonth, "EXACTLY ONE MONTH AGO"),
            formatMemories(lastMonthWeek, "AROUND THIS TIME LAST MONTH")
        ].filter(Boolean).join('\n\n');

        const prompt = `
            You are a warm, nostalgic memory assistant. 
            Look at these memories from the user's past:
            
            ${descriptions}
            
            Write a short, heartwarming, 1-2 sentence message inviting the user to revisit these moments. 
            Acknowledge the mix of timeframes if present (e.g., "From last year and last month...").
            Don't be too specific about details, just capture the vibe. 
            Use emojis.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating nostalgic message:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message, error.stack);
        }
        return "Rediscover your memories from this day in history! ✨";
    }
}
