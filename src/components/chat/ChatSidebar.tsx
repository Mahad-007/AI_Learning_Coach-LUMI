import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { XPService } from "@/services/xpService";
import { Progress } from "@/components/ui/progress";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  userName?: string;
  userLevel?: number;
  userXP?: number;
}

export function ChatSidebar({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  userName,
  userLevel,
  userXP,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        onNewChat();
      }

      toast.success("Chat deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete chat");
    }
  };

  const handleEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = async (sessionId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const newTitle = editTitle.trim();
      
      // Update using RPC function to avoid type issues
      // @ts-ignore
      const { error } = await supabase.rpc('update_session_title', {
        session_id: sessionId,
        new_title: newTitle,
      });

      if (error) throw error;

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      );
      setEditingId(null);
      toast.success("Chat renamed");
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to rename chat");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-1">
          AI Tutor
        </h2>
        <p className="text-xs text-muted-foreground">Gemini 2.0 Flash</p>
      </div>

      {/* New Chat Button */}
      <Button
        onClick={onNewChat}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all h-10 sm:h-11"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Chat
      </Button>

      {/* Stats Card */}
      <Card className="p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Level {userLevel || 1}
            </span>
            <span className="font-bold text-primary text-sm sm:text-base">{userXP || 0} XP</span>
          </div>
          <div>
            <Progress 
              value={XPService.getLevelProgress(userXP || 0, userLevel || 1)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {Math.ceil(XPService.getXPForNextLevel(userLevel || 1) - (userXP || 0))} XP to Level {(userLevel || 1) + 1}
            </p>
          </div>
        </div>
      </Card>

      {/* Chat Sessions List */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground">Recent Chats</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No chat history yet</p>
            <p className="text-xs mt-1">Start a new conversation!</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSessionSelect(session.id)}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50",
                    currentSessionId === session.id && "bg-primary/10 border border-primary/20"
                  )}
                >
                  {editingId === session.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(session.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleSaveEdit(session.id)}
                      >
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(session.updated_at)}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => handleEdit(session, e)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => handleDelete(session.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
        <p className="font-semibold text-foreground mb-1.5">💡 Quick Tips</p>
        <p>• Chats are auto-saved</p>
        <p>• Tap to switch chats</p>
        <p className="hidden sm:block">• Hover to edit/delete</p>
        <p className="sm:hidden">• Tap buttons to edit/delete</p>
      </div>
    </div>
  );
}

