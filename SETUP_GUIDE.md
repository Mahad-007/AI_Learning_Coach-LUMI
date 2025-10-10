# 🚀 AI Learning Coach - Complete Setup Guide

This guide will walk you through setting up your AI Learning Coach application from scratch.

## ⏱️ Estimated Time: 15-20 minutes

---

## Step 1: Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js** (v18 or higher) - [Download here](https://nodejs.org)
- ✅ **npm** or **yarn** package manager
- ✅ A **Supabase account** - [Sign up free](https://supabase.com)
- ✅ A **Google account** for Gemini API - [Get API key](https://makersuite.google.com/app/apikey)

---

## Step 2: Install Dependencies

The required packages are already installed:
- ✅ `@supabase/supabase-js` - Supabase client
- ✅ `@google/generative-ai` - Gemini AI client
- ✅ `@vercel/node` - TypeScript types (dev dependency)

---

## Step 3: Supabase Setup (10 minutes)

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: AI Learning Coach
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be ready

### 3.2 Get API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL** → Will be `VITE_SUPABASE_URL`
   - **anon public** key → Will be `VITE_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → Will be `SUPABASE_SERVICE_ROLE_KEY`

### 3.3 Set Up Database

1. In Supabase dashboard, click **SQL Editor** in sidebar
2. Click **"New query"**
3. Open `supabase/schema.sql` in your project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter`
7. You should see "Success. No rows returned"

✅ **Verify**: Go to **Table Editor** - you should see 7 tables:
- users
- lessons
- quizzes
- chat_history
- leaderboard
- user_progress
- badges

---

## Step 4: Gemini API Setup (2 minutes)

### 4.1 Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Choose **"Create API key in new project"**
5. Copy the API key (you won't see it again!)

---

## Step 5: Environment Variables

### 5.1 Create .env.local File

In your project root, create a file named `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 5.2 Replace Placeholders

Replace the placeholder values with the actual keys you copied earlier:

- `https://your-project.supabase.co` → Your Supabase Project URL
- `your_anon_key_here` → Your Supabase anon public key
- `your_service_role_key_here` → Your Supabase service_role key
- `your_gemini_api_key_here` → Your Google Gemini API key

**⚠️ Important:** 
- Never commit `.env.local` to git
- The `.env.local` file is already in `.gitignore`
- Keep your `service_role` key secure - it has admin access!

---

## Step 6: Test the Setup

### 6.1 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6.2 Test in Browser

1. Open `http://localhost:5173` in your browser
2. You should see your app without errors
3. Open browser console (F12) - no errors should appear

### 6.3 Test Authentication

Try signing up a test user to verify everything works:

```typescript
// In browser console or in your code
import { AuthService } from '@/services';

const response = await AuthService.signup({
  email: 'test@example.com',
  password: 'TestPassword123',
  name: 'Test User',
});

console.log('User created:', response.user);
```

✅ **Verify in Supabase:**
1. Go to **Authentication** in Supabase dashboard
2. You should see your test user
3. Go to **Table Editor** → **users** table
4. You should see the user profile with XP=0, Level=1

---

## Step 7: Using the Backend Services

### Import Services

```typescript
import {
  AuthService,
  ChatService,
  LessonService,
  QuizService,
  GamificationService,
  LeaderboardService,
  DashboardService,
} from '@/services';
```

### Quick Examples

**Authentication:**
```typescript
// Sign up
await AuthService.signup({ email, password, name });

// Login
await AuthService.login({ email, password });

// Get current user
const user = await AuthService.getCurrentUser();
```

**AI Chat:**
```typescript
const response = await ChatService.sendMessage(userId, {
  message: 'Explain quantum physics',
  topic: 'Physics',
});
console.log(response.reply);
```

**Generate Lesson:**
```typescript
const { lesson } = await LessonService.generateLesson(userId, {
  subject: 'Mathematics',
  topic: 'Algebra',
  difficulty: 'beginner',
  duration: 30,
});
```

**Generate Quiz:**
```typescript
const { quiz } = await QuizService.generateQuiz(userId, {
  lesson_id: lessonId,
  difficulty: 'intermediate',
  num_questions: 5,
  topic: 'Algebra',
});
```

---

## Step 8: Explore Examples

Check the `src/examples/` folder for comprehensive usage examples:

```bash
src/examples/
├── authExample.ts           # Authentication flows
├── chatExample.ts          # AI chat with streaming
├── lessonExample.ts        # Lesson generation
├── quizExample.ts          # Quiz management
├── gamificationExample.ts  # XP, levels, badges
├── leaderboardExample.ts   # Rankings
└── dashboardExample.ts     # User statistics
```

Each file contains multiple examples with React component snippets!

---

## 🎉 You're All Set!

Your AI Learning Coach backend is fully configured and ready to use!

### Next Steps

1. **Integrate with UI**: Connect the services to your React components
2. **Customize Personas**: Modify tutor personalities in `geminiClient.ts`
3. **Add Features**: Extend services with custom functionality
4. **Deploy**: When ready, deploy to Vercel, Netlify, or any static host

### Quick Reference

- 📚 **Main README**: See `README.md` for full documentation
- 🗄️ **Database Schema**: See `supabase/schema.sql`
- 📖 **Examples**: Check `src/examples/` for code samples
- 🔐 **Types**: All TypeScript types in `src/types/`

### Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

### Getting Help

- **Supabase Issues**: Check [Supabase Docs](https://supabase.com/docs)
- **Gemini API Issues**: Check [Gemini API Docs](https://ai.google.dev/docs)
- **General Questions**: Review the examples in `src/examples/`

---

## 🐛 Common Issues

### "Invalid API key" Error
- Double-check your `.env.local` file
- Ensure keys don't have extra spaces
- Restart dev server after changing .env file

### "No such table" Error
- Make sure you ran the SQL schema in Supabase
- Check Table Editor to verify tables exist

### RLS Policy Error
- Ensure you're authenticated (user logged in)
- Check RLS policies in Supabase dashboard

### Gemini API Rate Limit
- Free tier has limits (60 requests/minute)
- Consider implementing rate limiting in your app

---

**Happy Building! 🚀**

