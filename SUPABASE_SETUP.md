# Supabase Setup Guide

## Step 1: Apply Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `APPLY_MIGRATION.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon)
3. Click on **API**
4. Copy the **Project URL** and **anon public** key
5. Paste them into your `.env.local` file

## Step 3: Test the Functionality

After applying the migration and setting up environment variables:

1. Restart your development server: `npm run dev`
2. Create a new whiteboard session with "Generate join code for friends" checked
3. Share the generated code with your friend
4. Your friend should be able to join using the "Join by Code" button

## Troubleshooting

If you're still having issues:

1. **Check browser console** for any error messages
2. **Verify the migration was applied** by checking if the `room_code` column exists in `whiteboard_sessions` table
3. **Check environment variables** are properly set
4. **Ensure RLS policies** are correctly configured

## Common Issues:

- **"Session not found"**: Migration not applied or wrong Supabase project
- **"User not authenticated"**: Authentication not set up properly
- **"Permission denied"**: RLS policies not configured correctly
