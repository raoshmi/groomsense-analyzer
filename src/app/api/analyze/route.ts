import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const prompt = `
You are an elite ensemble of three AI Agents: a Dermatologist, a Master Stylist, and a High-Fashion Consultant.
Analyze the provided image of the user and provide a comprehensive grooming and style report.

OUTPUT FORMAT MUST BE STRICTLY VALID JSON exactly matching this structure, with NO extra text before or after:
{
  "score": <overall grooming score from 0 to 100 as an integer>,
  "skin": {
    "status": "<short summary of skin state>",
    "advice": "<detailed actionable dermatology advice>"
  },
  "hair": {
    "status": "<short summary of hair/facial hair state>",
    "advice": "<detailed styling advice for hair and beard>"
  },
  "style": {
    "status": "<short summary of visible clothing/posture>",
    "advice": "<fashion and aesthetic advice>"
  },
  "overall": "<A concluding paragraph synthesizing all 3 agents' findings into a final verdict>"
}
`;

    // Make the API call to Gemini with multimodal input
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: image,
            mimeType: 'image/jpeg', // Assuming jpeg from webcam/upload, Gemini handles it dynamically based on the base64 payload context
          }
        }
      ],
      config: {
        temperature: 0.4,
      }
    });

    const result = response.text;

    return NextResponse.json({ result });
    
  } catch (error: any) {
    console.error('Error in analyze API:', error);
    
    if (error.message?.includes('API key not valid') || error.message?.includes('API key not provided')) {
      return NextResponse.json(
        { error: 'Invalid or missing API Key. Please add your GEMINI_API_KEY to the .env.local file.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred during image analysis. Make sure the image is clear and not too large.' },
      { status: 500 }
    );
  }
}
