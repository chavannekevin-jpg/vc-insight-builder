import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, FileText, Bot, User, Sparkles, FileSpreadsheet, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDataRoomMessages, useAddMessage } from "@/hooks/useDataRoom";
import type { DataRoomFile, DataRoomSource } from "@/types/dataRoom";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface DataRoomChatProps {
  roomId: string;
  files: DataRoomFile[];
}

const SUGGESTED_QUESTIONS = [
  "What are the key financials?",
  "Summarize the business model",
  "What is the monthly burn rate?",
  "Who are the founders?",
  "What are the main risks?",
  "What is the ARR and MRR?",
];

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-excel': FileSpreadsheet,
  'text/csv': FileSpreadsheet,
  'image/png': Image,
  'image/jpeg': Image,
  'image/webp': Image,
};

export function DataRoomChat({ roomId, files }: DataRoomChatProps) {
  const { data: messages = [], refetch: refetchMessages } = useDataRoomMessages(roomId);
  const addMessage = useAddMessage(roomId);
  
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingSources, setStreamingSources] = useState<DataRoomSource[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage = text.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingSources([]);

    // Add user message to DB immediately
    await addMessage.mutateAsync({
      room_id: roomId,
      role: "user",
      content: userMessage,
      sources: null,
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-room-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            roomId,
            message: userMessage,
            history: messages.slice(-10).map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Chat failed");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";
      let sources: DataRoomSource[] = [];
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        let newlineIdx;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Handle sources
            if (parsed.sources) {
              sources = parsed.sources;
              setStreamingSources(sources);
              continue;
            }

            // Handle content delta
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setStreamingContent(fullContent);
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      // Save assistant message
      await addMessage.mutateAsync({
        room_id: roomId,
        role: "assistant",
        content: fullContent,
        sources: sources.length > 0 ? sources : null,
      });

      refetchMessages();
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      await addMessage.mutateAsync({
        room_id: roomId,
        role: "assistant",
        content: `I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        sources: null,
      });
      refetchMessages();
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      setStreamingSources([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const allMessages = [
    ...messages,
    ...(streamingContent ? [{
      id: "streaming",
      room_id: roomId,
      role: "assistant" as const,
      content: streamingContent,
      sources: streamingSources.length > 0 ? streamingSources : null,
      created_at: new Date().toISOString(),
    }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {allMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center mb-6 shadow-lg">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chat with your Data Room</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              Ask questions about the documents. I'll search through {files.length} file{files.length !== 1 ? 's' : ''} and cite my sources.
            </p>
            
            {/* File list */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-lg">
              {files.slice(0, 5).map((file) => {
                const Icon = FILE_TYPE_ICONS[file.file_type] || FileText;
                return (
                  <Badge 
                    key={file.id} 
                    variant="outline" 
                    className="text-xs gap-1.5 bg-card/50 backdrop-blur-sm"
                  >
                    <Icon className="w-3 h-3" />
                    {file.file_name.length > 20 ? file.file_name.slice(0, 17) + '...' : file.file_name}
                  </Badge>
                );
              })}
              {files.length > 5 && (
                <Badge variant="outline" className="text-xs bg-card/50">
                  +{files.length - 5} more
                </Badge>
              )}
            </div>

            {/* Suggested questions */}
            <div className="space-y-3 w-full max-w-md">
              <p className="text-xs font-medium text-muted-foreground">Suggested questions</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(q)}
                    disabled={isStreaming}
                    className="text-xs justify-start h-auto py-2 px-3 text-left bg-card/50 hover:bg-card/80 backdrop-blur-sm"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl p-4 shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/80 backdrop-blur-sm border border-border/30"
                  )}
                >
                  <div className={cn(
                    "text-sm prose prose-sm max-w-none",
                    msg.role === "user" && "prose-invert"
                  )}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Sources
                      </p>
                      {msg.sources.map((src, i) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/50"
                        >
                          <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <span className="font-medium text-foreground">{src.file_name}</span>
                            {src.excerpt && (
                              <span className="block text-muted-foreground mt-0.5 line-clamp-2">
                                "{src.excerpt}"
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isStreaming && !streamingContent && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/20 bg-card/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about burn rate, ARR, team, risks, or any other aspect..."
            disabled={isStreaming}
            className="min-h-[50px] max-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
            rows={1}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="shrink-0 h-[50px] w-[50px] rounded-xl shadow-lg"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
