import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  streamingMessage?: string;
  isLoading?: boolean;
  userName?: string;
  userAvatar?: string;
}

export function ChatWindow({
  messages,
  streamingMessage,
  isLoading = false,
  userName,
  userAvatar,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-background to-background/50"
    >
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && !streamingMessage ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center space-y-4 animate-in fade-in duration-700">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Ask me anything! I can explain concepts, solve problems, help with homework,
                  or discuss any topic you're curious about.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[
                  "Explain quantum physics",
                  "Help with calculus homework",
                  "Teach me about ancient Rome",
                  "What is machine learning?",
                ].map((example, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground hover:bg-muted transition-colors cursor-default"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                userName={userName}
                userAvatar={userAvatar}
              />
            ))}

            {/* Streaming Message */}
            {streamingMessage && (
              <ChatMessage
                role="assistant"
                content={streamingMessage}
                timestamp={new Date()}
                isStreaming={true}
              />
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingMessage && (
              <div className="flex gap-3 items-start mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

