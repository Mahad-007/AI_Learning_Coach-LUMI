# ✅ Backend Connected to UI!

Your backend is now fully integrated with your React app!

## 🎯 What Changed

### 1. **AuthContext** - Now uses real Supabase authentication
- ✅ Real login/signup with database
- ✅ Automatic session management
- ✅ Real user data (XP, level, streak)
- ✅ Toast notifications

### 2. **ProtectedRoute** - Now shows loading state
- ✅ Shows spinner while checking auth
- ✅ Redirects to login if not authenticated

### 3. **New Hook: `useBackend`** - Easy access to all services
- ✅ Simple API for all backend operations
- ✅ Automatic user ID handling
- ✅ Type-safe with TypeScript

---

## 🚀 How to Use in Your Pages

### Option 1: Use the `useBackend` Hook (Recommended)

```typescript
import { useBackend } from '@/hooks/useBackend';

function MyComponent() {
  const backend = useBackend();

  const handleSomething = async () => {
    // Send a chat message
    const response = await backend.chat.sendMessage('Hello AI!');
    
    // Generate a lesson
    const { lesson } = await backend.lessons.generate({
      subject: 'Math',
      topic: 'Algebra',
      difficulty: 'beginner',
      duration: 30,
    });
    
    // Get dashboard stats
    const stats = await backend.dashboard.getStats();
  };
}
```

### Option 2: Import Services Directly

```typescript
import { ChatService, LessonService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();

  const handleChat = async () => {
    if (!user) return;
    
    const response = await ChatService.sendMessage(user.id, {
      message: 'Explain quantum physics',
      topic: 'Physics',
    });
  };
}
```

---

## 📖 Quick Examples

### Chat Page Example

```typescript
import { useState } from 'react';
import { useBackend } from '@/hooks/useBackend';

export default function Chat() {
  const backend = useBackend();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const response = await backend.chat.sendMessage(input, {
        topic: 'General',
      });
      
      setMessages([...messages, {
        user: input,
        ai: response.reply,
        xp: response.xp_gained,
      }]);
      
      setInput('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your chat UI here */}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend} disabled={loading}>
        Send
      </button>
    </div>
  );
}
```

### Dashboard Example

```typescript
import { useEffect, useState } from 'react';
import { useBackend } from '@/hooks/useBackend';

export default function Dashboard() {
  const backend = useBackend();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await backend.dashboard.getStats();
    setStats(data);
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Level {stats.xp.level}</h1>
      <p>Total XP: {stats.xp.total}</p>
      <p>Streak: {stats.streak.current} days 🔥</p>
      <p>Lessons Completed: {stats.lessons.completed}</p>
      {/* More stats... */}
    </div>
  );
}
```

### Leaderboard Example

```typescript
import { useEffect, useState } from 'react';
import { useBackend } from '@/hooks/useBackend';

export default function Leaderboard() {
  const backend = useBackend();
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await backend.leaderboard.getAll();
    setLeaderboard(data);
  };

  if (!leaderboard) return <div>Loading...</div>;

  return (
    <div>
      <h1>Leaderboard</h1>
      {leaderboard.global.map((entry, index) => (
        <div key={entry.user_id}>
          #{index + 1} {entry.user_name} - {entry.total_xp} XP
        </div>
      ))}
    </div>
  );
}
```

### Generate Lesson Example

```typescript
import { useState } from 'react';
import { useBackend } from '@/hooks/useBackend';
import { useNavigate } from 'react-router-dom';

export default function CreateLesson() {
  const backend = useBackend();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    duration: 30,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { lesson } = await backend.lessons.generate(form);
      
      alert(`Lesson created! You earned ${lesson.xp_reward} XP!`);
      navigate(`/lesson/${lesson.id}`);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      alert('Failed to generate lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        placeholder="Subject"
      />
      <input
        value={form.topic}
        onChange={(e) => setForm({ ...form, topic: e.target.value })}
        placeholder="Topic"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Lesson'}
      </button>
    </div>
  );
}
```

---

## 🎮 Available Services

### `backend.chat`
- `sendMessage(message, options)` - Send chat message
- `sendMessageStream(message, onChunk, options)` - Streaming response
- `getHistory(limit, topic)` - Get chat history
- `getTopics()` - Get all chat topics
- `clearHistory(topic)` - Clear chat history

### `backend.lessons`
- `generate(params)` - Generate new lesson
- `get(lessonId)` - Get lesson by ID
- `getAll()` - Get all user lessons
- `updateProgress(lessonId, timeSpent)` - Update progress
- `complete(lessonId)` - Mark lesson complete
- `search(query)` - Search lessons
- `delete(lessonId)` - Delete lesson

### `backend.quizzes`
- `generate(params)` - Generate quiz
- `generateAdaptive(params)` - Adaptive quiz
- `get(quizId)` - Get quiz by ID
- `submit(quizId, answers)` - Submit quiz answers
- `getLessonQuizzes(lessonId)` - Get quizzes for lesson
- `getUserQuizzes()` - Get all user quizzes

### `backend.gamification`
- `awardXP(activityType, multiplier)` - Award XP
- `updateStreak()` - Update daily streak
- `getLevelInfo(xp)` - Get level progression info
- `getBadges()` - Get user badges
- `calculateLevel(xp)` - Calculate level from XP
- `getXPForLevel(level)` - Get XP required for level

### `backend.leaderboard`
- `getAll()` - Get all leaderboards
- `getGlobal(limit)` - Get global leaderboard
- `getWeekly(limit)` - Get weekly leaderboard
- `getMonthly(limit)` - Get monthly leaderboard
- `getPosition()` - Get user position

### `backend.dashboard`
- `getStats()` - Get comprehensive stats
- `getAnalytics()` - Get learning analytics

---

## 🧪 Test It Now!

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Try signing up:**
   - Go to `/signup`
   - Create an account
   - Check Supabase dashboard to see the user created!

3. **Test login:**
   - Go to `/login`
   - Login with your credentials
   - You should be logged in with real data!

4. **Check browser console:**
   ```javascript
   // In browser console, test the backend:
   import { ChatService } from '@/services';
   
   // Get current user from context
   const userId = 'your-user-id';
   
   // Send a message
   const response = await ChatService.sendMessage(userId, {
     message: 'Hello!',
   });
   
   console.log(response);
   ```

---

## 🐛 Common Issues

### "Cannot find module '@/services'"
**Fix:** Make sure your `tsconfig.json` has the path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "User is null"
**Fix:** Make sure you're using `useBackend` inside a protected route or check:
```typescript
const { user } = useAuth();
if (!user) {
  return <div>Please login</div>;
}
```

### "Environment variables not found"
**Fix:** 
1. Make sure `.env` file exists
2. Restart dev server after changing `.env`
3. Variables must start with `VITE_` to be exposed to client

---

## 📚 Next Steps

1. **Update your existing pages** with the backend integration
2. **Check `src/examples/`** for more detailed examples
3. **Read `INTEGRATION_GUIDE.md`** for page-by-page integration
4. **Customize the services** as needed for your app

---

**🎉 Your backend is now fully connected and ready to use!**

