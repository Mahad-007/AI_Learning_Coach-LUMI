import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatWindow, ChatInput, ChatSidebar, LearningPrompt } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateStreamWithPersonaFast } from "@/lib/geminiClient";
import { supabase } from "@/lib/supabaseClient";
import { XPUpdateService } from "@/services/xpUpdateService";
import { AchievementSystem } from "@/services/achievementSystem";
import type { Persona } from "@/types/user";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  session_id: string;
  user_id: string;
  role: string;
  message: string;
  created_at: string;
}

export default function Chat() {
  const { user, updateProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [persona] = useState<Persona>("friendly");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [aiMessageCount, setAiMessageCount] = useState(0);
  const [showLearningPrompt, setShowLearningPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      initializeChat();
    }
  }, [user]);

  const initializeChat = async () => {
    try {
      // Try to load the most recent session
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        const session = sessions[0] as any;
        if (session?.id) {
          setCurrentSessionId(session.id);
          await loadSessionMessages(session.id);
        }
      } else {
        // Create a new session if none exist
        await createNewSession();
      }
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: "New Chat",
        } as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned");

      setCurrentSessionId((data as any).id);
      setMessages([]);
      toast.success("New chat started");
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create new chat");
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data as ChatHistory[] || []).map((item) => ({
        id: item.id,
        role: item.role as "user" | "assistant",
        content: item.message,
        timestamp: new Date(item.created_at),
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load chat history");
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await loadSessionMessages(sessionId);
    // Reset AI message count when switching sessions
    setAiMessageCount(0);
    setShowLearningPrompt(false);
  };

  const handleNewChat = async () => {
    await createNewSession();
    // Reset AI message count for new chat
    setAiMessageCount(0);
    setShowLearningPrompt(false);
  };

  const generateChatTitle = async (message: string): Promise<string> => {
    // Simple title generation from first few words
    const words = message.split(" ").slice(0, 5).join(" ");
    return words.length > 40 ? words.substring(0, 40) + "..." : words;
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        // @ts-ignore - Supabase type issue with chat_sessions table
        .update({ title })
        .eq("id", sessionId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Failed to update session title:", error);
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!user || !currentSessionId) return null;

    try {
      const { data, error } = await supabase
        .from("chat_history")
        .insert({
          user_id: user.id,
          session_id: currentSessionId,
          role: role,
          message: content,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error("Failed to save message:", error);
      return null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user || isLoading || !currentSessionId) return;

    // If this is the first message in the session, update the title
    if (messages.length === 0) {
      const title = await generateChatTitle(content);
      await updateSessionTitle(currentSessionId, title);
    }

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Save user message to database
      const savedUserMsg = await saveMessage("user", content);
      if (savedUserMsg?.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, id: savedUserMsg.id } : msg
          )
        );
      }

      // Get recent context (last 10 messages)
      const recentMessages = messages
        .slice(-10)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const contextualPrompt = recentMessages
        ? `Previous conversation:\n${recentMessages}\n\nUser: ${content}`
        : content;

      // Stream AI response
      let fullResponse = "";
      await generateStreamWithPersonaFast(
        contextualPrompt,
        persona,
        (chunk) => {
          fullResponse += chunk;
          setStreamingMessage((prev) => prev + chunk);
        }
      );

      // Save AI response to database
      const savedAIMsg = await saveMessage("assistant", fullResponse);

      // Add complete AI message
      const aiMessage: Message = {
        id: savedAIMsg?.id || `temp-ai-${Date.now()}`,
        role: "assistant",
        content: fullResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setStreamingMessage("");

      // Increment AI message count and check if we should show learning prompt
      const newAiCount = aiMessageCount + 1;
      setAiMessageCount(newAiCount);

      // Show learning prompt after every 6 AI messages
      const shouldShowPrompt = newAiCount % 6 === 0;

      // Award XP and check achievements
      if (user) {
        try {
          // Award 1 XP for chat message
          await XPUpdateService.addXP(user.id, 1, 'chat_message');
          
          // Check for first-time chat badge
          await AchievementSystem.awardFirstTimeBadge(user.id, {
            badge_type: 'first_time',
            badge_name: 'Conversation Starter',
            badge_description: 'Sent your first AI chat message',
            badge_icon: '💬',
          });

          // Evaluate count-based achievements (like Chat Enthusiast at 50 messages)
          await AchievementSystem.evaluateAchievements();
        } catch (error) {
          console.error('[Chat] Failed to award XP/achievements:', error);
        }
      }

      // Show learning prompt after AI responds if it's the 6th message
      if (shouldShowPrompt) {
        setShowLearningPrompt(true);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response", {
        description: error.message || "Please try again.",
      });

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueLearning = () => {
    setShowLearningPrompt(false);
    toast.success("Keep learning! 📚", {
      description: "Your progress is being tracked.",
    });
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex pt-16 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card/50 backdrop-blur-lg border-r border-border/50 transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-80" : "w-0"
        )}
      >
        {sidebarOpen && (
          <ChatSidebar
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
            userName={user?.name}
            userLevel={user?.level}
            userXP={user?.xp}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 p-4 flex items-center gap-4 bg-card/30 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-primary/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">AI Learning Coach</h1>
            <p className="text-xs text-muted-foreground">
              Gemini 2.0 Flash • Real-time streaming • Markdown support
            </p>
          </div>
        </div>

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
          userName={user?.name}
          userAvatar={user?.avatar}
        />

        {/* Learning Prompt - appears after every 6 AI messages */}
        {showLearningPrompt && (
          <LearningPrompt 
            onContinue={handleContinueLearning}
            chatContext={messages.map(m => ({ role: m.role, content: m.content }))}
          />
        )}

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
