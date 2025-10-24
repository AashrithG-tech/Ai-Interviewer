import { useState, useRef, useEffect } from "react";
import { Message, SentimentState } from "@/types/interview";
import { ChatMessage } from "./ChatMessage";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { analyzeSentiment } from "@/lib/sentimentAnalysis";
import { getNextQuestion, getEncouragingResponse } from "@/lib/interviewQuestions";
import { toast } from "sonner";

interface InterviewChatProps {
  onComplete: (
    messages: Message[],
    timeline: { question: number; sentiment: SentimentState; confidence: number }[]
  ) => void;
}

export const InterviewChat = ({ onComplete }: InterviewChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emotionalTimeline, setEmotionalTimeline] = useState<
    { question: number; sentiment: SentimentState; confidence: number }[]
  >([]);
  const [lastSentiment, setLastSentiment] = useState<SentimentState>("NEUTRAL");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_QUESTIONS = 5;

  useEffect(() => {
    // Start the interview with the first question
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to FairHire AI. I'm here to conduct your interview in a supportive and adaptive way. I'll adjust my approach based on how you're feeling to ensure a fair evaluation. Let's begin!",
      timestamp: new Date(),
    };

    const firstQuestion: Message = {
      id: "q0",
      role: "assistant",
      content: getNextQuestion(0, "NEUTRAL"),
      timestamp: new Date(),
    };

    setMessages([welcomeMessage, firstQuestion]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || currentQuestion >= MAX_QUESTIONS) return;

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Analyze sentiment
    const sentiment = analyzeSentiment(input);
    userMessage.sentiment = sentiment;

    // Calculate confidence based on response
    const confidence = sentiment === "CONFIDENT" ? 85 : sentiment === "ANXIOUS" ? 45 : 65;

    // Update timeline
    const newTimelineEntry = {
      question: currentQuestion,
      sentiment,
      confidence,
    };

    setEmotionalTimeline((prev) => [...prev, newTimelineEntry]);
    setLastSentiment(sentiment);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI processing
    setTimeout(() => {
      const responses: Message[] = [];

      // Add encouraging response if needed
      if (sentiment === "ANXIOUS" || sentiment === "CONFUSED") {
        const encouragingMsg: Message = {
          id: `encourage-${Date.now()}`,
          role: "assistant",
          content: getEncouragingResponse(sentiment),
          timestamp: new Date(),
        };
        responses.push(encouragingMsg);
      } else if (sentiment === "CONFIDENT") {
        const acknowledgment: Message = {
          id: `ack-${Date.now()}`,
          role: "assistant",
          content: getEncouragingResponse(sentiment),
          timestamp: new Date(),
        };
        responses.push(acknowledgment);
      }

      const nextQuestionIndex = currentQuestion + 1;

      if (nextQuestionIndex < MAX_QUESTIONS) {
        // Ask next question
        const nextQuestionMsg: Message = {
          id: `q${nextQuestionIndex}`,
          role: "assistant",
          content: getNextQuestion(nextQuestionIndex, sentiment),
          timestamp: new Date(),
        };
        responses.push(nextQuestionMsg);
        setCurrentQuestion(nextQuestionIndex);
      } else {
        // Interview complete
        const completeMsg: Message = {
          id: "complete",
          role: "assistant",
          content:
            "Thank you so much for your time today. You did wonderfully! I've completed my evaluation, and your reflection portal is now ready. Click 'View Results' to see your personalized feedback.",
          timestamp: new Date(),
        };
        responses.push(completeMsg);

        toast.success("Interview Complete!", {
          description: "Your reflection portal is ready to view.",
        });
      }

      setMessages((prev) => [...prev, ...responses]);
      setIsProcessing(false);

      // If interview is complete, trigger callback
      if (nextQuestionIndex >= MAX_QUESTIONS) {
        setTimeout(() => {
          onComplete([...messages, userMessage, ...responses], [
            ...emotionalTimeline,
            newTimelineEntry,
          ]);
        }, 1000);
      }
    }, 1500);
  };

  const isComplete = currentQuestion >= MAX_QUESTIONS;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => {
          const isEncouraging =
            message.role === "assistant" &&
            (lastSentiment === "ANXIOUS" || lastSentiment === "CONFUSED") &&
            index === messages.length - 2;

          return <ChatMessage key={message.id} message={message} isEncouraging={isEncouraging} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {!isComplete && (
        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[60px] resize-none"
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px] shrink-0 bg-gradient-primary shadow-soft hover:shadow-lg transition-all"
              disabled={isProcessing || !input.trim()}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Question {currentQuestion + 1} of {MAX_QUESTIONS} • Press Enter to send, Shift+Enter
            for new line
          </p>
        </div>
      )}
    </div>
  );
};
