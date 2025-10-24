import { SentimentState } from "@/types/interview";

export interface QuestionSet {
  standard: string;
  encouraging: string;
  simplified: string;
}

export const interviewQuestions: QuestionSet[] = [
  {
    standard: "Tell me about yourself and what brings you to this interview today.",
    encouraging: "I'd love to hear your story. What interests you most about this opportunity? Take your time.",
    simplified: "Let's start simple - what kind of work do you enjoy doing?",
  },
  {
    standard: "Describe a challenging project you've worked on and how you handled it.",
    encouraging: "Think about a time when you did something you're proud of. What made it special for you?",
    simplified: "Tell me about something you worked on. What did you do?",
  },
  {
    standard: "How do you approach problem-solving in your work?",
    encouraging: "Everyone solves problems differently. What's your style? There's no wrong answer here.",
    simplified: "When something goes wrong, what do you usually do?",
  },
  {
    standard: "What are your key strengths and how do they apply to this role?",
    encouraging: "What do you do really well? I'd love to hear about your talents.",
    simplified: "What are you good at?",
  },
  {
    standard: "Where do you see yourself in the next few years professionally?",
    encouraging: "What are you hoping for in your future? Let's dream a little together.",
    simplified: "What would you like to do next in your career?",
  },
];

export function getNextQuestion(
  questionIndex: number,
  sentiment: SentimentState
): string {
  if (questionIndex >= interviewQuestions.length) {
    return "Thank you for your time. That completes our interview.";
  }

  const questionSet = interviewQuestions[questionIndex];

  switch (sentiment) {
    case "ANXIOUS":
      return questionSet.encouraging;
    case "CONFUSED":
      return questionSet.simplified;
    case "CONFIDENT":
    case "NEUTRAL":
    default:
      return questionSet.standard;
  }
}

export function getEncouragingResponse(sentiment: SentimentState): string {
  switch (sentiment) {
    case "ANXIOUS":
      return "I can sense you might be feeling a bit nervous, and that's completely okay. Take a deep breath. There's no rush at all. Let's talk about something that really excites you.";
    case "CONFUSED":
      return "Let me rephrase that to make it clearer. I want to make sure we're on the same page.";
    case "CONFIDENT":
      return "That's wonderful to hear! Your confidence really comes through.";
    case "NEUTRAL":
    default:
      return "Thank you for sharing that with me.";
  }
}
