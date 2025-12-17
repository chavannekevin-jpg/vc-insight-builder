import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  X, 
  Loader2, 
  Bot, 
  User,
  TrendingUp,
  Users,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  { icon: TrendingUp, label: "Conversion Analysis", query: "Analyze my conversion funnel. Where are users dropping off and why?" },
  { icon: Users, label: "User Behavior", query: "What patterns do you see in user behavior? Who completes the questionnaire vs who abandons?" },
  { icon: AlertTriangle, label: "Drop-off Points", query: "Identify the biggest drop-off points and suggest fixes." },
  { icon: Sparkles, label: "Growth Ideas", query: "Based on the data, what are 3 specific things I should do to increase conversions?" },
];

export const AdminAnalyticsChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-analytics-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add assistant message placeholder
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === "assistant") {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, put back in buffer
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-bold text-foreground mt-3 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="font-bold text-lg text-foreground mt-4 mb-2">{line.slice(2)}</h2>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="text-sm">{line}</p>;
      });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 gradient-primary"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300",
      isMinimized ? "w-80 h-14" : "w-96 h-[600px]"
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Analytics Assistant</h3>
            <p className="text-xs text-muted-foreground">AI-powered insights</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Bot className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    I can help you understand your platform data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ask me anything about conversions, user behavior, or growth
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quick Questions
                  </p>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.query)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                    >
                      <q.icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="p-2 rounded-lg bg-primary/10 h-fit">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert">
                          {renderMarkdown(message.content)}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="p-2 rounded-lg bg-muted h-fit">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about conversions, users, revenue..."
                className="min-h-[44px] max-h-[120px] resize-none"
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
                disabled={!input.trim() || isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
