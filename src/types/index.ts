export type Language = 'en' | 'hi';

export interface UserProfile {
  skinType?: string;
  hairType?: string;
  concerns?: string[];
  latestScore?: number;
  weather?: string;
  pollution?: string;
  ageGroup?: string;
  gender?: string;
}

export interface ProductRecommendation {
  type: string;
  reason: string;
}

export interface SkinAnalysis {
  type: string;
  concerns: string[];
  hydrationLevel: string;
  status: string;
  advice: string;
}

export interface HairAnalysis {
  type: string;
  condition: string;
  facialHair: string;
  status: string;
  advice: string;
}

export interface StyleAnalysis {
  status: string;
  advice: string;
}

export interface Recommendations {
  morningRoutine: string[];
  nightRoutine: string[];
  weeklyTips: string[];
  environmentAdjustments: string;
  products: ProductRecommendation[];
}

export interface ConfidenceScores {
  skin: number;
  hair: number;
  style: number;
}

export interface AnalysisResult {
  score: number;
  scoreBreakdown: {
    skin: number;
    hair: number;
    style: number;
    hygiene: number;
  };
  skinAnalysis: SkinAnalysis;
  hairAnalysis: HairAnalysis;
  styleAnalysis: StyleAnalysis;
  recommendations: Recommendations;
  overall: string;
  improvementAreas: string[];
  confidenceScores?: ConfidenceScores;
}

export interface ComparisonResult {
  scoreBefore: number;
  scoreAfter: number;
  scoreDelta: number;
  scoreBreakdownBefore: {
    skin: number;
    hair: number;
    style: number;
    hygiene: number;
  };
  scoreBreakdownAfter: {
    skin: number;
    hair: number;
    style: number;
    hygiene: number;
  };
  skinComparison: {
    beforeType: string;
    afterType: string;
    improvements: string[];
    advice: string;
  };
  hairComparison: {
    beforeStyle: string;
    afterStyle: string;
    improvements: string[];
    advice: string;
  };
  styleComparison: {
    beforeStyle: string;
    afterStyle: string;
    improvements: string[];
    advice: string;
  };
  overallComparison: string;
  confidenceScores?: ConfidenceScores;
}

export interface DebugData {
  prompt: string;
  rawResponse: string;
}
