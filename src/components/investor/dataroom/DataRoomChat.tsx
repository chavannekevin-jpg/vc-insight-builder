import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, FileText, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDataRoomMessages, useAddMessage } from "@/hooks/useDataRoom";
import type { DataRoomFile, DataRoomMessage, DataRoomSource } from "@/types/dataRoom";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface DataRoomChatProps {
  roomId: string;
  files: DataRoomFile[];
}

const SUGGESTED_QUESTIONS = [
  "What are the key financials?",
  "Summarize the business model",
  "What is the burn rate?",
  "Who are the founders?",
  "What are the main risks?",
];

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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {allMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Bot className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Chat with your data room</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Ask questions about the documents. I'll search through {files.length} file{files.length !== 1 ? 's' : ''} and tell you where I found the information.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(q)}
                  disabled={isStreaming}
                  className="text-xs"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
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
                    <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                      {msg.sources.map((src, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">{src.file_name}</span>
                            {src.excerpt && (
                              <span className="block text-muted-foreground/70 italic truncate max-w-[200px]">
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isStreaming && !streamingContent && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the documents..."
            disabled={isStreaming}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
