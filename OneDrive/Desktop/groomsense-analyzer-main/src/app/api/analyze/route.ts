import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/services/gemini';

export async function POST(req: NextRequest) {
  try {
    const { image, userProfile, lang = 'en' } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const rawResult = await analyzeImage(image, userProfile, lang);
    return NextResponse.json({ 
      result: rawResult.result, 
      debug: { prompt: rawResult.prompt, rawResponse: rawResult.result } 
    });

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

