import { NextRequest, NextResponse } from 'next/server';
import { compareImages } from '@/services/gemini';

export async function POST(req: NextRequest) {
  try {
    const { imageA, imageB, userProfile, lang = 'en' } = await req.json();

    if (!imageA || !imageB) {
      return NextResponse.json({ error: 'Both images are required for comparison.' }, { status: 400 });
    }

    const rawResult = await compareImages(imageA, imageB, userProfile, lang);
    return NextResponse.json({ 
      result: rawResult.result, 
      debug: { prompt: rawResult.prompt, rawResponse: rawResult.result } 
    });

  } catch (error: any) {
    console.error('Error in compare API:', error);

    if (error.message?.includes('API key not valid') || error.message?.includes('API key not provided')) {
      return NextResponse.json(
        { error: 'Invalid or missing API Key. Please add your GEMINI_API_KEY to the .env.local file.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during comparison analysis. Make sure both images are clear and not too large.' },
      { status: 500 }
    );
  }
}
