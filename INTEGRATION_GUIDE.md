# 🔌 Integration Guide - Connecting Services to UI

This guide shows you how to integrate the backend services with your existing React pages.

---

## 🎯 Overview

Your project already has these pages in `src/pages/`:
- `Login.tsx` / `Signup.tsx` - Authentication
- `Dashboard.tsx` - User overview
- `Chat.tsx` - AI chat interface
- `Lesson.tsx` - Lesson viewer
- `Quiz.tsx` - Quiz taking
- `Leaderboard.tsx` - Rankings
- `Profile.tsx` - User profile

Let's integrate the services with each page!

---

## 1. Update AuthContext (`src/contexts/AuthContext.tsx`)

Replace or update your AuthContext to use the new AuthService:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services';
import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePersona: (persona: User['persona']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await AuthService.signup({ email, password, name });
    setUser(response.user);
  };

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    setUser(response.user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const updatePersona = async (persona: User['persona']) => {
    if (!user) return;
    const updated = await AuthService.updatePersona(user.id, persona);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updatePersona }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 2. Login Page (`src/pages/Login.tsx`)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
```

---

## 3. Dashboard Page (`src/pages/Dashboard.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardService, GamificationService } from '@/services';
import type { DashboardStats } from '@/types/gamification';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    
    try {
      const data = await DashboardService.getDashboardStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {stats.user.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* XP Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Level {stats.xp.level}</h3>
          <p className="text-3xl font-bold mb-4">{stats.xp.total} XP</p>
          <Progress value={stats.xp.progress_percentage} className="mb-2" />
          <p className="text-sm text-gray-600">
            {stats.xp.progress_percentage}% to next level
          </p>
        </Card>

        {/* Streak Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">🔥 Streak</h3>
          <p className="text-3xl font-bold mb-4">{stats.streak.current} days</p>
          <p className="text-sm text-gray-600">
            Best: {stats.streak.longest} days
          </p>
        </Card>

        {/* Lessons Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Lessons</h3>
          <p className="text-3xl font-bold mb-4">{stats.lessons.completed}</p>
          <p className="text-sm text-gray-600">
            {stats.lessons.completion_rate}% completion rate
          </p>
        </Card>

        {/* Quizzes Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Quizzes</h3>
          <p className="text-3xl font-bold mb-4">{stats.quizzes.average_score}%</p>
          <p className="text-sm text-gray-600">
            {stats.quizzes.perfect_scores} perfect scores
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {stats.recent_activity.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
              {activity.xp_gained > 0 && (
                <span className="text-green-600 font-semibold">+{activity.xp_gained} XP</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

---

## 4. Chat Page (`src/pages/Chat.tsx`)

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services';
import type { ChatMessage } from '@/types/ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const history = await ChatService.getChatHistory(user.id, 50);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input;
    setInput('');
    setLoading(true);
    setStreamingResponse('');

    try {
      await ChatService.sendMessageStream(user, {
        message: userMessage,
        topic: 'General',
        onChunk: (chunk) => {
          setStreamingResponse((prev) => prev + chunk);
        },
      });

      // Reload chat history after completion
      await loadChatHistory();
      setStreamingResponse('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">AI Tutor Chat</h1>

      <Card className="flex-1 overflow-y-auto p-4 mb-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className="bg-blue-100 p-3 rounded-lg mb-2">
                <p className="font-semibold">You:</p>
                <p>{msg.message}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold">AI Tutor ({msg.persona}):</p>
                <p>{msg.response}</p>
              </div>
            </div>
          ))}

          {streamingResponse && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="font-semibold">AI Tutor:</p>
              <p>{streamingResponse}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Card>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? 'Thinking...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
```

---

## 5. Leaderboard Page (`src/pages/Leaderboard.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LeaderboardService } from '@/services';
import type { LeaderboardResponse } from '@/types/gamification';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      const data = await LeaderboardService.getLeaderboard(user?.id);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading leaderboard...</div>;
  if (!leaderboard) return <div>Failed to load leaderboard</div>;

  const renderLeaderboard = (entries: any[], type: 'global' | 'weekly' | 'monthly') => {
    const getXP = (entry: any) => {
      if (type === 'weekly') return entry.weekly_xp;
      if (type === 'monthly') return entry.monthly_xp;
      return entry.total_xp;
    };

    return (
      <div className="space-y-2">
        {entries.slice(0, 50).map((entry, index) => (
          <Card
            key={entry.user_id}
            className={`p-4 flex items-center justify-between ${
              entry.user_id === user?.id ? 'bg-blue-50 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold w-12">
                {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
              </span>
              <div>
                <p className="font-semibold">{entry.user_name}</p>
                <p className="text-sm text-gray-600">Level {entry.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{getXP(entry)} XP</p>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      {leaderboard.user_position && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <h2 className="text-2xl font-bold mb-2">Your Rank</h2>
          <p className="text-4xl font-bold">#{leaderboard.user_position.rank}</p>
          <p className="text-lg mt-2">{leaderboard.user_position.total_xp} Total XP</p>
        </Card>
      )}

      <Tabs defaultValue="global">
        <TabsList className="mb-6">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          {renderLeaderboard(leaderboard.global, 'global')}
        </TabsContent>

        <TabsContent value="weekly">
          {renderLeaderboard(leaderboard.weekly, 'weekly')}
        </TabsContent>

        <TabsContent value="monthly">
          {renderLeaderboard(leaderboard.monthly, 'monthly')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 6. Creating Lessons (New Component or in Dashboard)

```typescript
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LessonService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function CreateLesson() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { lesson } = await LessonService.generateLesson(user.id, {
        subject,
        topic,
        difficulty,
        duration,
      });

      alert(`Lesson created! You earned ${lesson.xp_reward} XP`);
      // Navigate to lesson or refresh list
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      alert('Failed to generate lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Subject (e.g., Mathematics)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      
      <Input
        placeholder="Topic (e.g., Quadratic Equations)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as any)}
        className="w-full p-2 border rounded"
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <Input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        min={10}
        max={120}
      />

      <Button onClick={handleGenerate} disabled={loading} className="w-full">
        {loading ? 'Generating...' : 'Generate Lesson'}
      </Button>
    </div>
  );
}
```

---

## 🎯 Summary

You now have:

1. ✅ **AuthContext** integrated with AuthService
2. ✅ **Login/Signup** pages using real authentication
3. ✅ **Dashboard** showing real statistics
4. ✅ **Chat** with streaming AI responses
5. ✅ **Leaderboard** with real rankings
6. ✅ **CreateLesson** component for lesson generation

### Next Steps:

1. Update your existing pages with these examples
2. Add the CreateLesson component to your UI
3. Create Quiz taking interface similar to Chat
4. Add Profile page for persona selection
5. Test everything with real data!

---

**Happy Coding! 🚀**

