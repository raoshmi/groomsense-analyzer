import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { image, userProfile } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const weatherContext = userProfile?.weather || 'moderate';
    const pollutionContext = userProfile?.pollution || 'medium';
    const ageGroup = userProfile?.ageGroup || 'adult';
    const gender = userProfile?.gender || 'unspecified';

    const prompt = `
You are an elite ensemble of three specialized AI agents working together:
1. Dr. Skin — World-class Dermatologist (Computer Vision specialist)
2. Alex — Master Hair Stylist
3. Vera — High-Fashion Consultant & Grooming Coach

Analyze the provided face/upper-body image using Computer Vision techniques. Be specific, data-driven, and medically accurate.

User Context:
- Weather/Environment: ${weatherContext}
- Pollution Level: ${pollutionContext}
- Age Group: ${ageGroup}
- Gender: ${gender}

OUTPUT FORMAT: Strictly return ONLY valid JSON matching this EXACT structure, with no extra text:
{
  "score": <overall grooming score 0-100 as integer>,
  "scoreBreakdown": {
    "skin": <skin sub-score 0-100>,
    "hair": <hair sub-score 0-100>,
    "style": <style sub-score 0-100>,
    "hygiene": <overall hygiene estimate 0-100>
  },
  "skinAnalysis": {
    "type": "<oily|dry|combination|normal|sensitive>",
    "concerns": ["<concern1>", "<concern2>"],
    "hydrationLevel": "<low|medium|high>",
    "status": "<short clinical summary>",
    "advice": "<detailed dermatology advice>"
  },
  "hairAnalysis": {
    "type": "<straight|wavy|curly|coily>",
    "condition": "<healthy|dry|oily|thinning|damaged>",
    "facialHair": "<clean-shaven|stubble|beard|mustache|none-visible>",
    "status": "<short summary>",
    "advice": "<detailed styling advice>"
  },
  "styleAnalysis": {
    "status": "<short summary of visible style>",
    "advice": "<fashion and aesthetic advice>"
  },
  "recommendations": {
    "morningRoutine": ["<step1>", "<step2>", "<step3>", "<step4>"],
    "nightRoutine": ["<step1>", "<step2>", "<step3>"],
    "weeklyTips": ["<tip1>", "<tip2>", "<tip3>"],
    "environmentAdjustments": "<advice based on ${weatherContext} weather and ${pollutionContext} pollution>",
    "products": [
      {"type": "<product type>", "reason": "<why recommended>"},
      {"type": "<product type>", "reason": "<why recommended>"},
      {"type": "<product type>", "reason": "<why recommended>"}
    ]
  },
  "overall": "<A concluding 2-3 sentence paragraph synthesizing all agents findings into a final personalized verdict>",
  "improvementAreas": ["<area1>", "<area2>", "<area3>"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: image,
            mimeType: 'image/jpeg',
          }
        }
      ],
      config: {
        temperature: 0.3,
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
