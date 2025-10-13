# 🎨 AI Learning Coach - Profile System Guide

## ✨ Overview

The AI Learning Coach now features a completely redesigned, modern profile experience that allows users to personalize their learning journey. This guide covers all the new features, implementation details, and usage instructions.

## 🎯 What's New

### 1. **Enhanced User Profile**
- **Display Name** - Customizable name shown throughout the app
- **Username** - Unique identifier with availability checking
- **Bio** - Short personal description (max 200 characters)
- **Avatar Selection** - 10 diverse, theme-matching avatars
- **Learning Mode** - Preferred learning style (AI Chat, Stories, Whiteboard, Quiz, Tutoring)
- **Theme Preference** - UI theme selection (Light, Dark, System)
- **AI Persona** - Learning assistant personality (Friendly, Strict, Fun, Scholar)

### 2. **Modern UI/UX Features**
✅ **Responsive Design** - Seamless experience on mobile and desktop  
✅ **Smooth Animations** - Fade-in, slide-in, scale effects throughout  
✅ **Real-time Updates** - Changes reflect instantly across the app  
✅ **Edit Mode** - Clean, intuitive profile editing interface  
✅ **Visual Feedback** - Loading states, success/error toasts  
✅ **Gradient Accents** - Beautiful color transitions matching app theme  
✅ **Hover Effects** - Interactive card scaling and shadow effects  
✅ **Form Validation** - Username uniqueness and required field checks  

### 3. **Avatar System**
The app now includes 10 carefully designed avatars:

**Female Avatars** (5):
- Luna Scholar - Purple background, scholarly appearance
- Sophie Bright - Pink background, bright and friendly
- Emma Wisdom - Blue background, wise and thoughtful
- Aria Green - Green background, natural and calm
- Maya Joy - Warm background, joyful and energetic

**Male Avatars** (5):
- Felix Explorer - Blue background, adventurous
- Max Nature - Green background, natural and grounded
- Leo Star - Golden background, star learner
- Oliver Sage - Purple background, wise scholar
- Kai Creative - Pink background, creative thinker

All avatars use the app's color palette (blues, purples, greens, pinks, teals) for visual consistency.

### 4. **Profile Tabs**

#### 📊 Stats Tab
- Lessons completed with completion rate
- Quiz average score and count
- Perfect quiz scores
- Current learning streak
- Total XP and level
- Lessons in progress

#### 🏆 Achievements Tab
- Badge collection display
- Earned date for each badge
- Empty state with call-to-action

#### 🥇 Leaderboard Tab
- Current user ranking
- XP comparison
- Quick link to full leaderboard

#### ⚙️ Settings Tab
- Account information display
- Quick edit and avatar change buttons
- All profile fields shown

## 🔧 Technical Implementation

### Database Schema
New fields added to `users` table:
```sql
- username TEXT UNIQUE
- bio TEXT
- learning_mode TEXT (ai_chat, stories, whiteboard, quiz, tutoring)
- theme_preference TEXT (light, dark, system)
```

### Type Definitions
```typescript
export type LearningMode = 'ai_chat' | 'stories' | 'whiteboard' | 'quiz' | 'tutoring';
export type ThemePreference = 'light' | 'dark' | 'system';

interface User {
  username?: string;
  bio?: string;
  learning_mode?: LearningMode;
  theme_preference?: ThemePreference;
  // ... other fields
}
```

### Key Components

#### 1. **Profile.tsx**
- Main profile page with view and edit modes
- Tabbed interface for stats, achievements, leaderboard, settings
- Form validation and real-time username checking
- Smooth animations and transitions

#### 2. **AvatarSelector.tsx**
- Modal dialog for avatar selection
- 10 diverse avatar options
- Visual selection state with checkmark
- Animated hover and selection effects

#### 3. **AuthContext.tsx**
- Extended to handle new profile fields
- Real-time profile updates
- Session persistence

#### 4. **AuthService.ts**
- Username availability checking
- Profile update with validation
- Error handling and feedback

### API Integration

#### Username Validation
```typescript
const isAvailable = await AuthService.checkUsernameAvailability(username, userId);
```

#### Profile Update
```typescript
await updateProfile({
  name: string,
  username: string,
  bio: string,
  learning_mode: LearningMode,
  theme_preference: ThemePreference,
  persona: Persona,
  avatar: string
});
```

## 🎨 Design System

### Color Palette
- **Primary (Indigo)**: `hsl(239 84% 67%)` - Main brand color
- **Secondary (Purple)**: `hsl(271 81% 56%)` - Accent color
- **Accent (Cyan)**: `hsl(199 89% 48%)` - Highlights
- **Success (Green)**: For achievements and XP
- **Orange**: For streaks and fire icons

### Animation Classes
```css
.animate-in fade-in duration-500
.slide-in-from-bottom-4
.transition-all duration-300
.hover:scale-105
.hover:shadow-lg
```

### Gradient Backgrounds
```css
bg-gradient-to-br from-primary/10 to-secondary/10
bg-gradient-to-r from-primary via-secondary to-accent
```

## 📱 Responsive Breakpoints

- **Mobile**: Base styles, vertical layout
- **Tablet (md:)**: 768px - 2-column grids
- **Desktop (lg:)**: 1024px - 3-column grids, horizontal layouts

## 🔐 Security Features

1. **Username Uniqueness** - Server-side validation
2. **RLS Policies** - Row-level security on all tables
3. **Auth Guards** - Protected routes
4. **Input Sanitization** - Character limits and validation

## 🚀 Usage Guide

### For Users

#### Viewing Your Profile
1. Click on your avatar in the navigation bar
2. Select "Profile" from the dropdown menu
3. View your stats, achievements, and settings

#### Editing Your Profile
1. Click "Edit Profile" button on the profile page
2. Modify any of the fields:
   - Display Name (required)
   - Username (must be unique)
   - Bio (max 200 characters)
   - Preferred Learning Mode
   - Theme Preference
   - AI Learning Persona
3. Click "Save Changes"
4. Changes reflect immediately

#### Changing Your Avatar
1. Click the camera icon on your profile picture
2. Select from 10 available avatars
3. Avatar updates instantly across the app

### For Developers

#### Adding New Profile Fields
1. Update database schema in `supabase/migrations/`
2. Add field to User type in `src/types/user.d.ts`
3. Update AuthContext to handle the new field
4. Add UI elements in Profile.tsx
5. Update authService if validation needed

#### Customizing Avatars
Edit `src/components/AvatarSelector.tsx`:
```typescript
export const AVATAR_OPTIONS = [
  {
    id: "avatar-11",
    url: "your-avatar-url",
    name: "Avatar Name",
    gender: "male/female"
  },
  // ...
];
```

## 🎯 Best Practices

1. **Always validate username** before saving
2. **Show loading states** during async operations
3. **Provide feedback** via toasts for all actions
4. **Keep animations smooth** - use CSS transitions
5. **Test on mobile** - ensure responsive behavior
6. **Maintain consistency** - use design system colors

## 🔄 Migration Guide

### Existing Users
The migration automatically:
- Generates username from name + user ID
- Sets default bio as "Learning enthusiast 📚"
- Sets learning_mode to "ai_chat"
- Sets theme_preference to "system"

### Running the Migration
```bash
# Apply the migration to your Supabase database
supabase db push
```

Or manually run:
```bash
psql -d your_database < supabase/migrations/add_profile_fields.sql
```

## 📊 Performance Considerations

1. **Lazy Loading** - Avatars load on-demand
2. **Debounced Validation** - Username checks are optimized
3. **Cached User Data** - Minimal database queries
4. **Optimistic Updates** - UI updates before server confirmation
5. **Lightweight Animations** - CSS-based, no heavy JS

## 🐛 Troubleshooting

### Username Already Taken
- Try a different username
- Check for typos
- Add numbers or underscores

### Profile Not Updating
- Check network connection
- Verify authentication status
- Check browser console for errors
- Ensure migration has been run

### Avatar Not Changing
- Clear browser cache
- Check if dialog is closing properly
- Verify avatar URL is accessible

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify design tokens in `index.css`

## 🎉 Features Showcase

### Key Highlights
✨ **10 Unique Avatars** - Diverse, theme-matching designs  
🎨 **Full Customization** - Name, username, bio, preferences  
⚡ **Real-time Updates** - Instant reflection across app  
📱 **Mobile-first Design** - Beautiful on all devices  
🔄 **Smooth Animations** - Professional transitions  
🎯 **Username Validation** - Instant availability checking  
🏆 **Achievement Display** - Showcase your badges  
📊 **Detailed Stats** - Track your learning progress  

## 📝 Changelog

### Version 2.0 - Profile Redesign
- ✅ Added username, bio, learning mode, theme preference fields
- ✅ Implemented 10 diverse avatar options
- ✅ Created modern edit mode with inline form
- ✅ Added smooth animations and transitions
- ✅ Implemented username uniqueness validation
- ✅ Redesigned stats and achievements display
- ✅ Added real-time profile updates
- ✅ Mobile-responsive layout improvements
- ✅ Enhanced visual feedback and loading states
- ✅ Integrated with existing gamification system

## 🤝 Contributing

To add new features to the profile system:
1. Create a feature branch
2. Update relevant files (schema, types, components)
3. Test thoroughly on mobile and desktop
4. Ensure animations are smooth
5. Submit PR with detailed description

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)

---

**Built with ❤️ for the AI Learning Coach community**

For questions or support, please reach out to the development team.

