export type SentimentState = "ANXIOUS" | "CONFIDENT" | "NEUTRAL" | "CONFUSED";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: SentimentState;
  timestamp: Date;
}

export interface InterviewState {
  currentQuestion: number;
  messages: Message[];
  emotionalTimeline: { question: number; sentiment: SentimentState; confidence: number }[];
  isComplete: boolean;
  confidenceScore: number;
}
