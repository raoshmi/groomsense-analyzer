import { predictNextScore } from '../utils/prediction';

describe('predictNextScore Linear Regression Engine tests', () => {
  test('returns null if there are fewer than 2 scores', () => {
    expect(predictNextScore([])).toBeNull();
    expect(predictNextScore([80])).toBeNull();
  });

  test('correctly predicts an upward trend (positive slope)', () => {
    // Scores: 60, 65, 70 (constant slope of +5 per step)
    // x = [1, 2, 3], y = [60, 65, 70]
    // Prediction for x = 4 (next week) should be 75 (+5 delta)
    const result = predictNextScore([60, 65, 70], 'en');
    expect(result).not.toBeNull();
    expect(result!.predictedScore).toBe(75);
    expect(result!.delta).toBe(5);
    expect(result!.trend).toBe('up');
    expect(result!.message).toContain('Outstanding styling trajectory');
  });

  test('correctly predicts a downward trend (negative slope)', () => {
    // Scores: 80, 75, 70 (constant slope of -5 per step)
    // Prediction for next week should be 65 (-5 delta)
    const result = predictNextScore([80, 75, 70], 'en');
    expect(result).not.toBeNull();
    expect(result!.predictedScore).toBe(65);
    expect(result!.delta).toBe(-5);
    expect(result!.trend).toBe('down');
    expect(result!.message).toContain('downward trajectory');
  });

  test('correctly handles stable/plateau trend', () => {
    const result = predictNextScore([70, 71, 70], 'en');
    expect(result).not.toBeNull();
    expect(result!.predictedScore).toBe(70);
    expect(result!.trend).toBe('stable');
    expect(result!.message).toContain('Stable grooming performance');
  });

  test('clamps predicted score between 0 and 100', () => {
    // Upward trend shooting past 100: 90, 95, 99
    // Next prediction would exceed 100 mathematically, should clamp to 100
    const resultUp = predictNextScore([90, 95, 99]);
    expect(resultUp!.predictedScore).toBe(100);

    // Downward trend shooting below 0: 10, 5, 2
    const resultDown = predictNextScore([10, 5, 2]);
    expect(resultDown!.predictedScore).toBe(0);
  });

  test('handles Hindi localization messages correctly', () => {
    const result = predictNextScore([60, 65, 70], 'hi');
    expect(result!.message).toContain('📈 आपकी प्रगति सकारात्मक है');
  });
});
