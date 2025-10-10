# Supabase Setup Instructions

This directory contains the database schema and migrations for the AI Learning Coach application.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your project URL and API keys from Project Settings > API

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `schema.sql` and paste it into the editor
5. Click **Run** to execute the schema

### Option 2: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project (if not already done):
   ```bash
   supabase init
   ```

3. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push the schema:
   ```bash
   supabase db push
   ```

## Environment Variables

After setting up the database, add these environment variables to your `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Structure

The schema includes the following tables:

- **users** - User profiles and gamification data
- **lessons** - Generated lessons with AI content
- **quizzes** - Quiz questions and answers
- **chat_history** - AI chat conversation history
- **leaderboard** - Global and time-based rankings
- **user_progress** - Lesson completion and quiz scores
- **badges** - Achievement badges earned by users

## Row Level Security (RLS)

The schema includes RLS policies that ensure:
- Users can only access their own data
- Leaderboard is publicly viewable
- Badges can be viewed by everyone but only created by the system

## Indexes

Indexes are created on frequently queried columns to optimize performance:
- User ID lookups
- Timestamp sorting
- XP rankings

## Maintenance

### Weekly Leaderboard Reset

Run this query every Monday to reset weekly XP:

```sql
UPDATE public.leaderboard SET weekly_xp = 0;
```

### Monthly Leaderboard Reset

Run this query on the 1st of each month to reset monthly XP:

```sql
UPDATE public.leaderboard SET monthly_xp = 0;
```

### Update Leaderboard Ranks

Run this periodically (e.g., every hour) to update user rankings:

```sql
SELECT update_leaderboard_ranks();
```

## Storage Setup (Optional)

If you want to enable avatar uploads:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `avatars`
3. Make it public
4. Set up RLS policies to allow users to upload their own avatars

## Testing

After setup, test the database connection by:

1. Starting your dev server
2. Attempting to sign up a new user
3. Checking the Supabase dashboard to verify the user was created

## Troubleshooting

### RLS Policy Errors

If you get RLS policy errors, make sure:
- You're authenticated with Supabase
- The user ID matches the auth.uid()
- Policies are enabled on all tables

### Connection Issues

If you can't connect to Supabase:
- Verify your environment variables
- Check that your project is not paused
- Ensure API keys are correct

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

