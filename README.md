# 🧠 AI Learning Coach - Full Backend Implementation

A comprehensive, gamified AI-powered learning platform built with **React**, **TypeScript**, **Supabase**, and **Google's Gemini AI**.

## 🚀 Features

- **🤖 AI-Powered Tutoring** - Interactive chat with personalized AI tutors using Gemini API
- **📚 Dynamic Lesson Generation** - AI creates custom lessons based on subject, topic, and difficulty
- **📝 Adaptive Quizzes** - Smart quiz generation that adapts to student performance
- **🎮 Gamification System** - XP, levels, streaks, and badges to motivate learning
- **🏆 Leaderboards** - Global, weekly, and monthly rankings
- **👥 Multiple Tutor Personas** - Friendly, Strict, Fun, or Scholar teaching styles
- **📊 Progress Tracking** - Comprehensive dashboard with analytics
- **🔐 Secure Authentication** - Powered by Supabase Auth with RLS

## 📂 Project Structure

```
ai-learning-coach/
├── src/
│   ├── lib/
│   │   ├── supabaseClient.ts      # Supabase configuration
│   │   ├── geminiClient.ts        # Gemini AI integration
│   │   └── utils.ts                # Utility functions
│   │
│   ├── services/                   # Backend service layer
│   │   ├── authService.ts         # Authentication
│   │   ├── chatService.ts         # AI chat
│   │   ├── lessonService.ts       # Lesson generation
│   │   ├── quizService.ts         # Quiz management
│   │   ├── gamificationService.ts # XP, levels, badges
│   │   ├── leaderboardService.ts  # Rankings
│   │   ├── dashboardService.ts    # User stats
│   │   └── index.ts               # Service exports
│   │
│   ├── types/                      # TypeScript definitions
│   │   ├── database.d.ts          # Supabase schema types
│   │   ├── user.d.ts              # User types
│   │   ├── lesson.d.ts            # Lesson types
│   │   ├── quiz.d.ts              # Quiz types
│   │   ├── ai.d.ts                # AI types
│   │   └── gamification.d.ts      # Gamification types
│   │
│   ├── examples/                   # Usage examples
│   │   ├── authExample.ts
│   │   ├── chatExample.ts
│   │   ├── lessonExample.ts
│   │   ├── quizExample.ts
│   │   ├── gamificationExample.ts
│   │   ├── leaderboardExample.ts
│   │   └── dashboardExample.ts
│   │
│   ├── components/                 # React UI components
│   ├── pages/                      # Page components
│   └── contexts/                   # React contexts
│
├── supabase/
│   ├── schema.sql                  # Database schema
│   └── README.md                   # Setup instructions
│
└── package.json
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **AI Engine** | Google Gemini API |
| **UI Components** | Radix UI + Tailwind CSS |
| **Styling** | Tailwind CSS |

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-learning-coach
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Where to get these:**
- **Supabase**: Create account at [supabase.com](https://supabase.com), create project, get keys from Project Settings > API
- **Gemini API**: Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/schema.sql`
4. Paste and execute in SQL Editor

See `supabase/README.md` for detailed instructions.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎯 Quick Start

### Authentication

```typescript
import { AuthService } from '@/services';

// Sign up
const { user, session } = await AuthService.signup({
  email: 'student@example.com',
  password: 'secure123',
  name: 'John Doe',
});

// Login
const response = await AuthService.login({
  email: 'student@example.com',
  password: 'secure123',
});
```

### AI Chat

```typescript
import { ChatService } from '@/services';

// Send message
const response = await ChatService.sendMessage(userId, {
  message: 'Explain photosynthesis',
  topic: 'Biology',
  persona: 'friendly',
});

console.log(response.reply); // AI response
console.log(response.xp_gained); // XP earned
```

### Lesson Generation

```typescript
import { LessonService } from '@/services';

// Generate lesson
const { lesson } = await LessonService.generateLesson(userId, {
  subject: 'Mathematics',
  topic: 'Quadratic Equations',
  difficulty: 'intermediate',
  duration: 30,
});

// Complete lesson
const xpEarned = await LessonService.completeLesson(userId, lesson.id);
```

### Quiz Generation

```typescript
import { QuizService } from '@/services';

// Generate quiz
const { quiz } = await QuizService.generateQuiz(userId, {
  lesson_id: lessonId,
  difficulty: 'beginner',
  num_questions: 5,
  topic: 'Photosynthesis',
});

// Submit answers
const result = await QuizService.submitQuiz(userId, {
  quiz_id: quiz.id,
  answers: {
    0: 'Option A',
    1: 'Option B',
    // ...
  },
});

console.log(result.percentage); // Score percentage
console.log(result.xp_earned); // XP earned
```

### Gamification

```typescript
import { GamificationService } from '@/services';

// Award XP
const update = await GamificationService.awardXP(userId, 'lesson_complete');

console.log(update.xp_gained); // XP gained
console.log(update.new_level); // Current level
console.log(update.level_up); // Did user level up?

// Get level info
const levelInfo = GamificationService.getLevelInfo(currentXP);
console.log(levelInfo.progress_percentage); // Progress to next level
```

### Leaderboard

```typescript
import { LeaderboardService } from '@/services';

// Get all leaderboards
const leaderboard = await LeaderboardService.getLeaderboard(userId);

console.log(leaderboard.global); // Global rankings
console.log(leaderboard.weekly); // Weekly rankings
console.log(leaderboard.user_position); // User's rank
```

### Dashboard

```typescript
import { DashboardService } from '@/services';

// Get comprehensive stats
const stats = await DashboardService.getDashboardStats(userId);

console.log(stats.xp); // XP and level info
console.log(stats.streak); // Daily streak
console.log(stats.lessons); // Lesson stats
console.log(stats.quizzes); // Quiz performance
console.log(stats.badges); // Earned badges
console.log(stats.recent_activity); // Activity feed
```

## 📚 Detailed Examples

Each service has comprehensive examples in the `src/examples/` directory:

- `authExample.ts` - Authentication flows
- `chatExample.ts` - AI chat interactions
- `lessonExample.ts` - Lesson generation and management
- `quizExample.ts` - Quiz creation and submission
- `gamificationExample.ts` - XP, levels, and badges
- `leaderboardExample.ts` - Rankings and competition
- `dashboardExample.ts` - User statistics and analytics

## 🎨 Tutor Personas

Choose from 4 distinct AI teaching styles:

| Persona | Description |
|---------|-------------|
| **Friendly** 😊 | Warm, encouraging, supportive |
| **Strict** 📏 | Formal, direct, high standards |
| **Fun** 🎉 | Playful, humorous, entertaining |
| **Scholar** 🎓 | Academic, comprehensive, intellectual |

## 📊 Database Schema

### Core Tables

- `users` - User profiles with XP, level, streak
- `lessons` - AI-generated lessons
- `quizzes` - Quiz questions and answers
- `chat_history` - AI conversation logs
- `leaderboard` - Rankings (global/weekly/monthly)
- `user_progress` - Lesson completion tracking
- `badges` - Achievement system

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Leaderboard is publicly viewable
- Secure by default

## 🔒 Security Best Practices

1. ✅ Environment variables for sensitive keys
2. ✅ Supabase RLS policies enforce data access
3. ✅ Client-side auth with secure JWT tokens
4. ✅ No service role key exposed to client
5. ✅ Input validation on all user inputs
6. ✅ SQL injection prevention via Supabase client

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Option 2: Netlify

```bash
npm run build
# Deploy dist/ folder
```

### Option 3: Any Static Host

```bash
npm run build
```

Upload `dist/` folder to your host.

## 📈 Gamification System

### XP Rewards

| Activity | Base XP |
|----------|---------|
| Chat Message | 5 XP |
| Lesson Created | 10 XP |
| Lesson Completed | 50 XP |
| Quiz Completed | 30 XP |
| Perfect Quiz | 50 XP |
| Daily Streak | 20 XP |

### Level Formula

```typescript
level = floor(sqrt(total_xp / 100)) + 1

// Examples:
// 0 XP = Level 1
// 100 XP = Level 2
// 400 XP = Level 3
// 900 XP = Level 4
```

### Streak Bonuses

- 3+ days: +10% XP bonus
- 7+ days: +20% XP bonus
- 14+ days: +30% XP bonus
- 30+ days: +50% XP bonus

## 🐛 Troubleshooting

### Supabase Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is not paused
- Ensure RLS policies are enabled

### Gemini API Errors

- Verify API key is valid
- Check API quota limits
- Ensure proper error handling in code

### Build Errors

```bash
npm run type-check  # Check TypeScript errors
npm run lint        # Check ESLint errors
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 💬 Support

For questions or issues:
1. Check the examples in `src/examples/`
2. Review the Supabase setup guide in `supabase/README.md`
3. Open an issue on GitHub

## 🎓 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Built with ❤️ using React, TypeScript, Supabase, and Gemini AI**
