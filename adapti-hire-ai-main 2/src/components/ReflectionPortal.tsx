import { Message, SentimentState } from "@/types/interview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Heart, Shield, BarChart3, MessageSquare, Target, Lightbulb, Clock, Download } from "lucide-react";
import { calculateConfidence } from "@/lib/sentimentAnalysis";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface ReflectionPortalProps {
  messages: Message[];
  timeline: { question: number; sentiment: SentimentState; confidence: number }[];
}

const getSentimentColor = (sentiment: SentimentState) => {
  switch (sentiment) {
    case "ANXIOUS":
      return "text-accent";
    case "CONFIDENT":
      return "text-chart-3";
    case "CONFUSED":
      return "text-chart-4";
    default:
      return "text-chart-1";
  }
};

const getSentimentLabel = (sentiment: SentimentState) => {
  switch (sentiment) {
    case "ANXIOUS":
      return "Anxious";
    case "CONFIDENT":
      return "Confident";
    case "CONFUSED":
      return "Seeking Clarity";
    default:
      return "Neutral";
  }
};

export const ReflectionPortal = ({ messages, timeline }: ReflectionPortalProps) => {
  const userMessages = messages.filter((m) => m.role === "user");
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const sentiments = userMessages.map((m) => m.sentiment || "NEUTRAL");
  const confidenceScore = calculateConfidence(sentiments);

  // Prepare chart data
  const chartData = timeline.map((entry) => ({
    question: `Q${entry.question + 1}`,
    confidence: entry.confidence,
    sentiment: entry.sentiment,
  }));

  // Calculate response metrics
  const avgResponseLength = Math.round(
    userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length
  );
  const totalWords = userMessages.reduce(
    (sum, m) => sum + m.content.split(/\s+/).length,
    0
  );

  // Identify strengths and improvements
  const confidentResponses = userMessages.filter(
    (m) => m.sentiment === "CONFIDENT"
  ).length;
  const anxiousResponses = userMessages.filter(
    (m) => m.sentiment === "ANXIOUS"
  ).length;

  const handleDownloadReport = () => {
    const reportData = {
      confidenceScore,
      totalQuestions: timeline.length,
      sentimentBreakdown: sentiments,
      avgResponseLength,
      totalWords,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fairhire-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Your Reflection Portal
        </h1>
        <p className="text-muted-foreground">
          A personalized analysis of your interview journey
        </p>
        <Button onClick={handleDownloadReport} variant="outline" size="sm" className="mt-2">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Confidence Score
            </CardTitle>
            <CardDescription>Overall performance assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary">{confidenceScore}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              {confidenceScore >= 75
                ? "Excellent performance!"
                : confidenceScore >= 50
                ? "Good solid responses"
                : "Room for growth"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" />
              Emotional Journey
            </CardTitle>
            <CardDescription>Your emotional states detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(sentiments)).map((sentiment) => (
                <div key={sentiment} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getSentimentColor(sentiment)}`}>
                    {getSentimentLabel(sentiment)}
                  </span>
                  <Badge variant="secondary">
                    {sentiments.filter((s) => s === sentiment).length}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-chart-3" />
              Bias Reduction
            </CardTitle>
            <CardDescription>Fairness in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />
                <span className="text-sm">Adaptive questioning</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Our AI adjusted {timeline.filter((t) => t.sentiment !== "NEUTRAL").length} times to
                ensure you felt comfortable and understood.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Emotional Timeline
          </CardTitle>
          <CardDescription>
            How your confidence evolved throughout the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="question" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-chart-3" />
              Key Strengths
            </CardTitle>
            <CardDescription>What you did well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {confidentResponses > 0 && (
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-3 mt-1" />
                  <span className="text-sm">
                    Showed confidence in {confidentResponses} response
                    {confidentResponses > 1 ? "s" : ""}, demonstrating strong subject knowledge
                  </span>
                </li>
              )}
              {avgResponseLength > 100 && (
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-chart-3 mt-1" />
                  <span className="text-sm">
                    Provided detailed, thoughtful responses (avg. {avgResponseLength} characters)
                  </span>
                </li>
              )}
              {totalWords > 50 && (
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-chart-3 mt-1" />
                  <span className="text-sm">
                    Engaged meaningfully with {totalWords} words across all responses
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-chart-4" />
              Growth Opportunities
            </CardTitle>
            <CardDescription>Areas to focus on next time</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {anxiousResponses > 1 && (
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-chart-4 mt-1" />
                  <span className="text-sm">
                    Practice managing interview anxiety through mock interviews and breathing techniques
                  </span>
                </li>
              )}
              {avgResponseLength < 80 && (
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-chart-4 mt-1" />
                  <span className="text-sm">
                    Consider elaborating more on your experiences with specific examples
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-chart-4 mt-1" />
                <span className="text-sm">
                  Continue building confidence by reflecting on past achievements and successes
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Interview Breakdown
          </CardTitle>
          <CardDescription>Question-by-question analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assistantMessages.slice(0, 5).map((msg, idx) => {
            const userResponse = userMessages[idx];
            return (
              <div key={msg.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">
                    Q{idx + 1}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">{msg.content}</p>
                    {userResponse && (
                      <>
                        <p className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                          {userResponse.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getSentimentColor(
                              userResponse.sentiment || "NEUTRAL"
                            )}
                          >
                            {getSentimentLabel(userResponse.sentiment || "NEUTRAL")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {userResponse.content.split(/\s+/).length} words
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {idx < assistantMessages.slice(0, 5).length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-calm">
        <CardHeader>
          <CardTitle>Bias Reduction Narrative</CardTitle>
          <CardDescription>How FairHire AI ensured a fair evaluation</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            Throughout this interview, our adaptive AI system monitored your emotional state and
            adjusted its approach to create a fair and supportive environment. Here's how we ensured
            an unbiased evaluation:
          </p>
          <ul className="space-y-2 mt-4">
            <li>
              <strong>Emotional Awareness:</strong> We detected{" "}
              {timeline.filter((t) => t.sentiment === "ANXIOUS").length} moments of anxiety and
              immediately shifted to more encouraging, open-ended questions.
            </li>
            <li>
              <strong>Clarity First:</strong> When confusion was detected, we rephrased questions to
              ensure you fully understood what was being asked, eliminating ambiguity-based bias.
            </li>
            <li>
              <strong>Confidence Building:</strong> Your confidence grew from{" "}
              {timeline[0]?.confidence || 65}% to {timeline[timeline.length - 1]?.confidence || 85}%
              , showing our adaptive approach helped you perform at your best.
            </li>
            <li>
              <strong>Fair Assessment:</strong> By adjusting to your emotional state, we ensured your
              answers reflected your true capabilities, not your interview anxiety.
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            This adaptive approach reduced traditional interview bias by creating a level playing
            field where candidates are evaluated on their skills and potential, not their ability to
            perform under pressure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
