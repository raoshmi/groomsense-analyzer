import { GoogleGenAI } from '@google/genai';
import { UserProfile, Language } from '../types';

const ai = new GoogleGenAI({});

export async function analyzeImage(
  imageBase64: string,
  userProfile: UserProfile,
  language: Language = 'en'
): Promise<{ result: string; prompt: string }> {
  const weatherContext = userProfile?.weather || 'moderate';
  const pollutionContext = userProfile?.pollution || 'medium';
  const ageGroup = userProfile?.ageGroup || 'adult';
  const gender = userProfile?.gender || 'unspecified';

  const languageInstruction = language === 'hi'
    ? `
IMPORTANT LANGUAGE INSTRUCTION:
You MUST generate all descriptive text, advice, routines, tips, environment adjustments, and summaries in fluent Devanagari Hindi (हिन्दी) or a premium natural Hinglish style that is easy to understand for Indian users.
HOWEVER, all JSON key names MUST remain strictly in English as specified in the output format.
For example, "advice": "आपकी त्वचा थोड़ी रूखी लग रही है..." is correct. "सलाह": "..." is INCORRECT.
`
    : '';

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

${languageInstruction}

OUTPUT FORMAT: Strictly return ONLY valid JSON matching this EXACT structure, with no extra markdown formatting (no \`\`\`json or \`\`\` wrappers), just raw JSON string:
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
  "improvementAreas": ["<area1>", "<area2>", "<area3>"],
  "confidenceScores": {
    "skin": <estimate dermatologist agent confidence 0-100 as integer based on image clarity and landmarks>,
    "hair": <estimate stylist agent confidence 0-100 as integer based on visible hairstyle details>,
    "style": <estimate fashion consultant agent confidence 0-100 as integer based on framing and attire>
  }
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        }
      }
    ],
    config: {
      temperature: 0.3,
    }
  });

  return {
    result: response.text || '',
    prompt: prompt.trim()
  };
}

export async function compareImages(
  imageABase64: string,
  imageBBase64: string,
  userProfile: UserProfile,
  language: Language = 'en'
): Promise<{ result: string; prompt: string }> {
  const weatherContext = userProfile?.weather || 'moderate';
  const pollutionContext = userProfile?.pollution || 'medium';
  const ageGroup = userProfile?.ageGroup || 'adult';
  const gender = userProfile?.gender || 'unspecified';

  const languageInstruction = language === 'hi'
    ? `
IMPORTANT LANGUAGE INSTRUCTION:
You MUST generate all comparison descriptions, improvements lists, and advice in fluent Devanagari Hindi (हिन्दी) or a premium natural Hinglish style.
HOWEVER, all JSON key names MUST remain strictly in English as specified in the output format.
`
    : '';

  const prompt = `
You are an elite ensemble of three specialized AI agents working together:
1. Dr. Skin — World-class Dermatologist
2. Alex — Master Hair Stylist
3. Vera — High-Fashion Consultant & Grooming Coach

You are given two images of the same user:
- Image A: "Before" image (the original state of the user).
- Image B: "After" image (the updated, groomed, or styled state).

Perform a side-by-side Computer Vision analysis to assess skin, hair, and style improvements, noting what changed, what got better, and what still needs attention.

User Context:
- Weather/Environment: ${weatherContext}
- Pollution Level: ${pollutionContext}
- Age Group: ${ageGroup}
- Gender: ${gender}

${languageInstruction}

OUTPUT FORMAT: Strictly return ONLY valid JSON matching this EXACT structure, with no extra markdown formatting, just a raw JSON string:
{
  "scoreBefore": <grooming score of Image A 0-100 as integer>,
  "scoreAfter": <grooming score of Image B 0-100 as integer>,
  "scoreDelta": <scoreAfter minus scoreBefore as integer, can be positive, negative, or zero>,
  "scoreBreakdownBefore": {
    "skin": <Image A skin score 0-100>,
    "hair": <Image A hair score 0-100>,
    "style": <Image A style score 0-100>,
    "hygiene": <Image A hygiene estimate 0-100>
  },
  "scoreBreakdownAfter": {
    "skin": <Image B skin score 0-100>,
    "hair": <Image B hair score 0-100>,
    "style": <Image B style score 0-100>,
    "hygiene": <Image B hygiene estimate 0-100>
  },
  "skinComparison": {
    "beforeType": "<skin type in Image A>",
    "afterType": "<skin type in Image B>",
    "improvements": ["<skin improvement observed 1>", "<skin improvement observed 2>"],
    "advice": "<focused clinical feedback comparing skin in both photos>"
  },
  "hairComparison": {
    "beforeStyle": "<hair and facial hair style in Image A>",
    "afterStyle": "<hair and facial hair style in Image B>",
    "improvements": ["<hair improvement observed 1>", "<hair improvement observed 2>"],
    "advice": "<stylist feedback on hair styling, beard grooming, or hairline neatness comparison>"
  },
  "styleComparison": {
    "beforeStyle": "<clothing/aesthetic in Image A>",
    "afterStyle": "<clothing/aesthetic in Image B>",
    "improvements": ["<style/outfit improvement observed 1>", "<style/outfit improvement observed 2>"],
    "advice": "<fashion feedback comparing overall outfits and accessories>"
  },
  "overallComparison": "<A thorough 3-4 sentence paragraph summarizing the grooming journey, the visible improvements, and cheering the user on their styling efforts.>",
  "confidenceScores": {
    "skin": <estimate dermatologist agent comparison confidence 0-100 as integer>,
    "hair": <estimate stylist agent comparison confidence 0-100 as integer>,
    "style": <estimate fashion consultant agent comparison confidence 0-100 as integer>
  }
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      prompt,
      {
        inlineData: {
          data: imageABase64,
          mimeType: 'image/jpeg',
        }
      },
      {
        inlineData: {
          data: imageBBase64,
          mimeType: 'image/jpeg',
        }
      }
    ],
    config: {
      temperature: 0.3,
    }
  });

  return {
    result: response.text || '',
    prompt: prompt.trim()
  };
}
