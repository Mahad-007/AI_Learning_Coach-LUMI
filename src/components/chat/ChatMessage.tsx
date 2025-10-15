import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  userName?: string;
  userAvatar?: string;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  userName = "User",
  userAvatar,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3 items-start mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-border shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] md:max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm transition-all",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
              : "bg-card border border-border rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className={cn("prose prose-sm dark:prose-invert max-w-none", !isUser && "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom styling for code blocks
                  code: ({ node, inline, className, children, ...props }: any) => {
                    return inline ? (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className={cn("block bg-muted p-3 rounded-lg overflow-x-auto", className)}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Style links
                  a: ({ node, children, ...props }: any) => (
                    <a
                      className="text-blue-500 hover:text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  // Style lists
                  ul: ({ node, children, ...props }: any) => (
                    <ul className="list-disc list-inside space-y-1 my-2" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ node, children, ...props }: any) => (
                    <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
                      {children}
                    </ol>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className={cn("text-xs text-muted-foreground px-1 sm:px-2", isUser ? "text-right" : "text-left")}>
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

