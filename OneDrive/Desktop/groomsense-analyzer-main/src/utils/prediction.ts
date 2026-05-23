export interface PredictionResult {
  predictedScore: number;
  delta: number;
  slope: number;
  intercept: number;
  trend: 'up' | 'down' | 'stable';
  message: string;
}

/**
 * Predicts the next score based on past score trends using Simple Linear Regression (y = mx + c).
 * Inputs:
 * - scores: list of past scores in order (oldest to newest)
 * - language: 'en' | 'hi' to return localized explanation messages
 */
export function predictNextScore(scores: number[], language: 'en' | 'hi' = 'en'): PredictionResult | null {
  const n = scores.length;
  if (n < 2) return null;

  // X values are just 1, 2, 3, ..., n
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = scores;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  // Calculate slope (m) and intercept (c)
  const denominator = n * sumXX - sumX * sumX;
  
  // If denominator is 0 (should not happen with distinct x values), slope is 0
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Predict N+1 index
  const nextX = n + 1;
  let predicted = slope * nextX + intercept;

  // Clamp prediction between 0 and 100
  predicted = Math.max(0, Math.min(100, predicted));
  const predictedScore = Math.round(predicted);
  const latestScore = scores[n - 1];
  const delta = predictedScore - latestScore;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (slope > 0.5) trend = 'up';
  else if (slope < -0.5) trend = 'down';

  // Generate localized explanation messages for resume appeal!
  let message = '';
  if (language === 'hi') {
    if (trend === 'up') {
      message = `📈 आपकी प्रगति सकारात्मक है! रैखिक पूर्वानुमान के अनुसार, यदि आप वर्तमान दिनचर्या जारी रखते हैं, तो आपका स्कोर अगले सप्ताह ${predictedScore} (${delta > 0 ? `+${delta}` : delta} अंक) तक पहुंच सकता है।`;
    } else if (trend === 'down') {
      message = `⚠️ रैखिक विश्लेषण हालिया स्कोर में गिरावट को दर्शाता है। अपनी अनुशंसित त्वचा/बालों की देखभाल दिनचर्या पर वापस ध्यान दें ताकि आपके स्कोर में दोबारा सुधार (प्रत्याशित: ${predictedScore}) हो सके।`;
    } else {
      message = `⚖️ आपकी ग्रूमिंग स्थिति स्थिर है। लगातार सुधार (अनुमानित स्कोर: ${predictedScore}) के लिए साप्ताहिक टिप्स और एआई सुधार क्षेत्रों पर अतिरिक्त ध्यान दें।`;
    }
  } else {
    if (trend === 'up') {
      message = `📈 Outstanding styling trajectory! Linear regression predicts your score could reach ${predictedScore} (${delta > 0 ? `+${delta}` : delta} pts) next week if you sustain your current routines.`;
    } else if (trend === 'down') {
      message = `⚠️ Linear analysis shows a slight downward trajectory. Re-align with your recommended morning/night skincare routines to reverse the trend (projected: ${predictedScore}).`;
    } else {
      message = `⚖️ Stable grooming performance! To push past the plateau (projected score: ${predictedScore}), focus on the weekly premium tips and specific improvement areas.`;
    }
  }

  return {
    predictedScore,
    delta,
    slope,
    intercept,
    trend,
    message
  };
}
