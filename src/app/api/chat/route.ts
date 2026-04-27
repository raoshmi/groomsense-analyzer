import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { message, userProfile, analysisHistory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const profileContext = userProfile ? `
User's skin type: ${userProfile.skinType || 'unknown'}
Hair type: ${userProfile.hairType || 'unknown'}
Main concerns: ${userProfile.concerns?.join(', ') || 'none specified'}
Current Groom Score: ${userProfile.latestScore || 'not analyzed yet'}
    ` : 'No profile data available yet.';

    const historyContext = analysisHistory?.length > 0
      ? `User has ${analysisHistory.length} past analysis sessions. Latest score: ${analysisHistory[analysisHistory.length - 1]?.score}`
      : 'No analysis history yet.';

    const prompt = `You are GroomSense AI, a friendly, knowledgeable grooming and skincare assistant.

User Profile:
${profileContext}

History Context:
${historyContext}

Rules:
- Give accurate, practical, and safe grooming advice
- Personalize answers based on the user profile when available  
- Keep responses concise (2-4 sentences max unless a list is needed)
- Be warm and encouraging, not clinical
- If asked about medical conditions (rashes, infections, etc.), always recommend consulting a dermatologist
- Focus on actionable tips the user can apply today
- Never recommend specific branded products by name

User Question: ${message}

Answer helpfully and naturally:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
      config: {
        temperature: 0.7,
        maxOutputTokens: 512,
      }
    });

    return NextResponse.json({ reply: response.text });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Chat service unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
