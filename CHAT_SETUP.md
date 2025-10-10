# 🚀 AI Chat System Setup Guide

## ✅ What's Included

A complete **Markdown-rendered AI chat system** with:
- ✨ **Real-time streaming** from Gemini API
- 📝 **Markdown rendering** (formulas, code blocks, lists, etc.)
- 💾 **Persistent chat history** in Supabase
- 🎨 **Beautiful UI** with smooth animations
- 📱 **Fully responsive** design

---

## 📦 Installation Steps

### 1. Dependencies (Already Installed)

The following packages have been added:
```bash
✅ react-markdown - Markdown rendering
✅ remark-gfm - GitHub Flavored Markdown
✅ rehype-highlight - Code syntax highlighting
✅ highlight.js - Syntax highlighting themes
```

### 2. Configure Environment Variables

Create `.env.local` in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get your keys:**
- **Gemini API**: https://makersuite.google.com/app/apikey
- **Supabase**: https://app.supabase.com (Project Settings → API)

### 3. Database Setup

The `chat_history` table already exists in `supabase/schema.sql`. It has:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `role` (text) - 'user' or 'assistant'  
- `message` (text) - Message content
- `timestamp` (timestamptz) - Auto timestamp

If you haven't run the schema yet:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and execute

### 4. Start Development Server

```bash
npm run dev
```

The server will start on **http://localhost:5173**

### 5. Test the Chat

1. Navigate to `/chat` or click "Chat" in the navigation
2. Type a message like: "Explain quantum physics"
3. Watch the AI response stream in real-time with Markdown formatting!

---

## 🎨 Features Showcase

### Markdown Support

The AI can render:

**Math formulas:**
```
The quadratic formula is: $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
```

**Code blocks with syntax highlighting:**
```python
def hello_world():
    print("Hello, World!")
```

**Lists, tables, bold, italic, links**, and more!

### Real-Time Streaming

- AI responses stream **character by character** or **word by word**
- Smooth typewriter effect
- Animated cursor during streaming

### Persistent History

- All messages auto-save to Supabase
- Chat history loads on page refresh
- Context-aware conversations (remembers last 10 messages)

### Beautiful UI

- User messages: Blue gradient (right side)
- AI messages: Card style with Markdown (left side)
- Avatars for user and AI
- Timestamps
- Empty state with example prompts
- Loading animations

---

## 📁 File Structure

```
src/
├── components/
│   └── Chat/
│       ├── ChatMessage.tsx     # Individual message bubble
│       ├── ChatInput.tsx       # Input field with send button
│       ├── ChatWindow.tsx      # Message list container
│       └── index.tsx          # Exports
│
├── pages/
│   └── Chat.tsx               # Main chat page
│
└── lib/
    └── geminiClient.ts        # Gemini API integration
```

---

## 🔧 Component Details

### ChatMessage.tsx
- Renders user/AI messages with Markdown
- Supports code syntax highlighting
- Custom styling for links, lists, code blocks
- Shows timestamps
- Streaming cursor animation

### ChatInput.tsx
- Textarea with auto-resize
- "Enter" to send, "Shift+Enter" for new line
- Send button with loading state
- Disabled during AI response

### ChatWindow.tsx
- Scrollable message list
- Auto-scrolls to bottom
- Empty state with example prompts
- Loading indicators (typing dots)
- Streaming message display

### Chat.tsx (Page)
- Manages message state
- Handles Gemini API streaming
- Saves to Supabase automatically
- Sidebar with stats and tips
- Context-aware prompts

---

## 🎯 Usage Examples

### Basic Question
```
User: "What is machine learning?"
AI: (Streams response with formatted text)
```

### Code Example
```
User: "Write a Python function to calculate fibonacci"
AI: Sure! Here's a function:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```
```

### Math Formula
```
User: "Show me the Pythagorean theorem"
AI: The Pythagorean theorem states: $a^2 + b^2 = c^2$
```

---

## 🐛 Troubleshooting

### Issue: "No response from AI"

**Solution:**
1. Check `.env.local` has valid `VITE_GEMINI_API_KEY`
2. Verify API key at https://makersuite.google.com/app/apikey
3. Restart dev server: `npm run dev`

### Issue: "Chat history not loading"

**Solution:**
1. Verify Supabase credentials in `.env.local`
2. Check `chat_history` table exists in Supabase
3. Verify RLS policies allow user access
4. Check browser console for errors

### Issue: "Markdown not rendering"

**Solution:**
- Ensure `react-markdown` and `remark-gfm` are installed
- Check if `highlight.js` CSS is imported in `index.css`

### Issue: "Streaming is slow"

**Solution:**
- Current implementation uses `generateStreamWithPersonaFast` for better speed
- You can switch to `generateStreamWithPersona` for character-by-character (smoother but slower)
- Edit `Chat.tsx` line with the streaming function call

---

## 🎨 Customization

### Change Streaming Speed

In `src/pages/Chat.tsx`, line ~150:

```typescript
// Faster (word by word):
await generateStreamWithPersonaFast(...)

// Slower but smoother (character by character):
await generateStreamWithPersona(...)
```

### Change AI Persona

In `src/pages/Chat.tsx`, update the persona state:

```typescript
const [persona] = useState<Persona>("friendly"); // or "strict", "fun", "scholar"
```

### Change Code Theme

In `src/index.css`, change the highlight.js theme:

```css
@import 'highlight.js/styles/github-dark.css';
/* Other themes: atom-one-dark, monokai, vs2015, etc. */
```

### Modify Message Styles

Edit `src/components/Chat/ChatMessage.tsx`:
- Line 46-52: User message styles
- Line 54-98: AI message styles with Markdown

---

## 📊 How It Works

1. **User sends message** → Saved to Supabase immediately
2. **Context retrieved** → Last 10 messages for conversation memory
3. **Gemini API called** → Streaming response starts
4. **UI updates** → Each chunk displayed in real-time
5. **AI response complete** → Saved to Supabase
6. **XP awarded** → User gets +5 XP (optional)

---

## 🚀 Next Steps

- ✅ Chat system is ready to use!
- Try asking complex questions
- Test Markdown rendering with code/formulas
- Check chat history persistence
- Customize the UI to your liking

---

## 📖 Documentation

- **Gemini API**: https://ai.google.dev/docs
- **react-markdown**: https://github.com/remarkjs/react-markdown
- **Supabase**: https://supabase.com/docs

---

**Enjoy your AI-powered learning coach! 🎉**

