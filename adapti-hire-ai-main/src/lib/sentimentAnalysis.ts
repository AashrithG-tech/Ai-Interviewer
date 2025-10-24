import { SentimentState } from "@/types/interview";

const anxiousKeywords = [
  "nervous",
  "anxious",
  "worried",
  "stressed",
  "unsure",
  "scared",
  "don't know",
  "not sure",
  "maybe",
  "struggling",
];

const confidentKeywords = [
  "confident",
  "excited",
  "great",
  "excellent",
  "sure",
  "definitely",
  "absolutely",
  "successful",
  "achieved",
  "proud",
];

const confusedKeywords = [
  "confused",
  "unclear",
  "don't understand",
  "what do you mean",
  "could you clarify",
  "repeat",
  "explain",
  "huh",
  "sorry",
];

export function analyzeSentiment(text: string): SentimentState {
  const lowerText = text.toLowerCase();
  
  // Check for confusion first as it requires immediate clarification
  const confusedScore = confusedKeywords.filter((keyword) =>
    lowerText.includes(keyword)
  ).length;
  
  if (confusedScore > 0) {
    return "CONFUSED";
  }
  
  const anxiousScore = anxiousKeywords.filter((keyword) =>
    lowerText.includes(keyword)
  ).length;
  
  const confidentScore = confidentKeywords.filter((keyword) =>
    lowerText.includes(keyword)
  ).length;
  
  // Calculate confidence based on message length and positive indicators
  const wordCount = text.split(/\s+/).length;
  const hasDetailedResponse = wordCount > 20;
  
  if (anxiousScore > confidentScore) {
    return "ANXIOUS";
  }
  
  if (confidentScore > 0 || hasDetailedResponse) {
    return "CONFIDENT";
  }
  
  return "NEUTRAL";
}

export function calculateConfidence(sentimentHistory: SentimentState[]): number {
  const confidentCount = sentimentHistory.filter(s => s === "CONFIDENT").length;
  const anxiousCount = sentimentHistory.filter(s => s === "ANXIOUS").length;
  
  const baseScore = 50;
  const confidentBoost = confidentCount * 15;
  const anxiousPenalty = anxiousCount * 10;
  
  return Math.min(100, Math.max(0, baseScore + confidentBoost - anxiousPenalty));
}
