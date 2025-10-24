import { useState } from "react";
import { Message, SentimentState } from "@/types/interview";
import { InterviewChat } from "@/components/InterviewChat";
import { ReflectionPortal } from "@/components/ReflectionPortal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

const Index = () => {
  const [showReflection, setShowReflection] = useState(false);
  const [interviewData, setInterviewData] = useState<{
    messages: Message[];
    timeline: { question: number; sentiment: SentimentState; confidence: number }[];
  } | null>(null);

  const handleInterviewComplete = (
    messages: Message[],
    timeline: { question: number; sentiment: SentimentState; confidence: number }[]
  ) => {
    setInterviewData({ messages, timeline });
  };

  const handleViewResults = () => {
    if (interviewData) {
      setShowReflection(true);
    }
  };

  const handleBackToInterview = () => {
    setShowReflection(false);
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FairHire AI
            </h1>
          </div>
          {showReflection && (
            <Button variant="outline" onClick={handleBackToInterview}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interview
            </Button>
          )}
          {interviewData && !showReflection && (
            <Button onClick={handleViewResults} className="bg-gradient-primary shadow-soft">
              View Results
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {showReflection && interviewData ? (
          <ReflectionPortal messages={interviewData.messages} timeline={interviewData.timeline} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden h-[calc(100vh-12rem)]">
              <div className="bg-gradient-primary text-primary-foreground px-6 py-4">
                <h2 className="text-xl font-semibold">The Adaptive Interviewer</h2>
                <p className="text-sm opacity-90">
                  Your AI interview partner that adapts to support you
                </p>
              </div>
              <InterviewChat onComplete={handleInterviewComplete} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
