# 🚀 START HERE - Quick Setup Guide

## ✅ Your AI Learning Coach is Ready!

Everything is implemented. Just follow these 4 simple steps:

---

## Step 1: Add API Keys (2 minutes)

Create `.env.local` file in root directory:

```env
VITE_GEMINI_API_KEY=get_from_google
VITE_SUPABASE_URL=get_from_supabase
VITE_SUPABASE_ANON_KEY=get_from_supabase
```

**Where to get:**
- Gemini: https://makersuite.google.com/app/apikey
- Supabase: https://app.supabase.com → Your Project → Settings → API

---

## Step 2: Run Database Migrations (3 minutes)

Go to **Supabase Dashboard → SQL Editor**

Run these **3 files in order**:

### 1️⃣ update_chat_history.sql
```
📁 supabase/migrations/update_chat_history.sql
Copy → Paste in SQL Editor → Run
```

### 2️⃣ add_chat_sessions.sql
```
📁 supabase/migrations/add_chat_sessions.sql
Copy → Paste in SQL Editor → Run
```

### 3️⃣ add_quiz_tracking_and_xp.sql
```
📁 supabase/migrations/add_quiz_tracking_and_xp.sql
Copy → Paste in SQL Editor → Run
```

All should show: **"Success. No rows returned"**

---

## Step 3: Start Server (30 seconds)

```bash
npm run dev
```

Server starts on: **http://localhost:8081**

---

## Step 4: Test Everything! (5 minutes)

### 🔐 Login
1. Open http://localhost:8081
2. Click "Get Started"
3. Create account

### 💬 Test Chat
1. Click "AI Chat" in navigation
2. Send message: "Explain quantum physics"
3. ✅ AI streams response with Markdown
4. ✅ See "+1 XP earned!" toast
5. ✅ XP bar in sidebar updates

### 🎯 Test Learning Prompt
1. Send 7 messages in chat
2. ✅ Prompt appears: "Take a Quiz" or "Continue Learning"

### 🧠 Test Quiz from Chat
1. Click "Take a Quiz"
2. ✅ AI generates quiz from your conversation
3. Answer questions
4. ✅ See XP earned (varies by difficulty)
5. ✅ Check completion screen

### 📚 Test Quiz by Topic
1. Go to `/quiz`
2. Choose "Quiz by Topic"
3. Enter: "Machine Learning"
4. Select: Advanced
5. Click "Generate Quiz"
6. ✅ AI creates 5 advanced questions
7. Answer them
8. ✅ See higher XP for advanced (+25 per correct)

---

## 🎉 What You Get

### Chat Features ✨
- Real-time AI streaming
- Markdown rendering (code, math, lists)
- Multiple chat sessions (like ChatGPT)
- Auto-named chats
- Edit/delete chats
- +1 XP per AI message
- Learning prompts every 7 messages

### Quiz Features 🧠
- AI-generated questions (no static data!)
- Two modes:
  - From chat (personalized)
  - By topic (search anything)
- 3 difficulties (Beginner/Intermediate/Advanced)
- Dynamic XP rewards:
  - Beginner: 10 XP per correct
  - Intermediate: 15 XP per correct
  - Advanced: 25 XP per correct
  - Perfect score: +20 bonus XP
- Quiz tracking in database
- Completion statistics

### Gamification 🎮
- XP system (+1 from chat, varies from quiz)
- Level progression
- Working XP progress bars
- Level up celebrations
- Quiz statistics tracking

---

## 📊 Quick XP Reference

| Action | XP Earned |
|--------|-----------|
| AI message in chat | +1 XP |
| Beginner quiz (perfect 5/5) | 70 XP |
| Intermediate quiz (perfect 5/5) | 95 XP |
| Advanced quiz (perfect 5/5) | 145 XP |

**Level Up:**
- Level 1 → 2: 100 XP
- Level 2 → 3: 300 XP total
- Level 3 → 4: 600 XP total
- Formula: `Level = floor(sqrt(XP / 100)) + 1`

---

## 🐛 Troubleshooting

### "Can't see AI Chat"
✅ Log in first! It only appears after authentication

### "Chat blank/not working"
✅ Run all 3 migrations
✅ Check `.env.local` has API keys
✅ Restart dev server

### "XP not increasing"
✅ Verify migration 3 ran successfully
✅ Check browser console for errors

### "Quiz won't generate"
✅ Verify Gemini API key is correct
✅ Check API quota hasn't been exceeded

---

## 📖 Full Documentation

For detailed info, see:
- **XP_SYSTEM_COMPLETE.md** - XP & quiz details
- **FINAL_SETUP_CHECKLIST.md** - Complete checklist
- **CHAT_SESSIONS_GUIDE.md** - Chat sessions guide
- **IMPLEMENTATION_COMPLETE.md** - Technical docs

---

## ✅ Checklist

Before you start:
- [ ] `.env.local` created with 3 API keys
- [ ] Migration 1 ran
- [ ] Migration 2 ran
- [ ] Migration 3 ran
- [ ] Dev server running on port 8081
- [ ] Logged into the app
- [ ] "AI Chat" link visible

Test features:
- [ ] Chat works with streaming
- [ ] XP increases (+1 per message)
- [ ] Progress bar moves
- [ ] 7 messages → Learning prompt appears
- [ ] Quiz generates from chat
- [ ] Quiz generates by topic
- [ ] XP awarded after quiz
- [ ] Level up works
- [ ] Chat sessions work

---

## 🎯 You're Done!

Everything is implemented and ready to use!

**Just need to:**
1. Add your API keys
2. Run 3 database migrations
3. Start the server
4. Start learning! 🎓

---

**Happy Learning!** 💬🧠✨

*AI Learning Coach - Powered by Gemini 2.0 Flash & Supabase*

