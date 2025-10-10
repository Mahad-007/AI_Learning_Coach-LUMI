import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Send, Mic, Menu, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackend } from "@/hooks/useBackend";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  xpGained?: number;
}

export default function Chat() {
  const { user } = useAuth();
  const backend = useBackend();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await backend.chat.getHistory(20);
      const formattedMessages: Message[] = [];
      
      history.forEach((msg) => {
        formattedMessages.push({
          id: `${msg.id}-user`,
          role: "user",
          content: msg.message,
          timestamp: new Date(msg.timestamp),
        });
        formattedMessages.push({
          id: `${msg.id}-ai`,
          role: "ai",
          content: msg.response,
          timestamp: new Date(msg.timestamp),
          xpGained: msg.xp_gained,
        });
      });

      setMessages(formattedMessages);

      // Add welcome message if no history
      if (history.length === 0) {
        setMessages([{
          id: "welcome",
          role: "ai",
          content: `Hello ${user?.name}! I'm your AI Learning Coach. I'm here to help you learn anything you want. What would you like to explore today?`,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Show welcome message on error
      setMessages([{
        id: "welcome",
        role: "ai",
        content: `Hello ${user?.name}! I'm your AI Learning Coach. What would you like to learn about today?`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = input;
    setInput("");
    setIsTyping(true);
    setStreamingText("");

    try {
      // Use streaming for real-time response
      const response = await backend.chat.sendMessageStream(
        messageContent,
        (chunk) => {
          setStreamingText(prev => prev + chunk);
        },
        { topic: "General" }
      );

      const aiMessage: Message = {
        id: response.message_id,
        role: "ai",
        content: response.reply,
        timestamp: new Date(response.timestamp),
        xpGained: response.xp_gained,
      };

      setMessages(prev => [...prev, aiMessage]);
      setStreamingText("");

      if (response.xp_gained > 0) {
        toast.success(`+${response.xp_gained} XP earned!`);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      setStreamingText("");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex pt-16">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0"
        )}
      >
        {sidebarOpen && (
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">AI Tutor</h2>
              <p className="text-sm text-muted-foreground">Persona: {user?.persona || 'Friendly'}</p>
            </div>

            <Card className="p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Your Progress</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Level {user?.level}</span>
                  <span className="font-medium">{user?.xp} XP</span>
                </div>
                <Progress value={50} className="h-2" />
                <p className="text-xs text-muted-foreground">Keep chatting to earn XP!</p>
              </div>
            </Card>

            <div className="text-sm text-muted-foreground space-y-2 mb-4">
              <p>💡 <strong>Tip:</strong> Ask me anything!</p>
              <p>🎓 I can help you with:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Explaining concepts</li>
                <li>Solving problems</li>
                <li>Practice questions</li>
                <li>Study tips</li>
              </ul>
            </div>

            <div className="mt-auto">
              <Button variant="hero" className="w-full" onClick={() => toast.info('Coming soon!')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Start New Lesson
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold">AI Learning Coach</h1>
            <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] md:max-w-[60%] rounded-2xl p-4 animate-scale-in",
                  message.role === "user"
                    ? "bg-gradient-primary text-white"
                    : "bg-card border border-border"
                )}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <p
                    className={cn(
                      "text-xs",
                      message.role === "user" ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {message.xpGained && message.xpGained > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      +{message.xpGained} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] md:max-w-[60%] bg-card border border-border rounded-2xl p-4">
                {streamingText ? (
                  <p className="text-sm md:text-base whitespace-pre-wrap">{streamingText}</p>
                ) : (
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button variant="ghost" size="icon" className="hover:bg-primary/10" onClick={() => toast.info('Voice input coming soon!')}>
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSend}
              variant="hero"
              size="icon"
              className="animate-pulse-glow"
              disabled={isTyping || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
