-- Migration: Fix Users RLS Policy to Allow Public Profile Viewing (V2)
-- This migration ensures everyone can view all users' public profiles for leaderboards

-- First, drop ALL existing SELECT policies on users table to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public user profiles" ON public.users;

-- Create a single comprehensive SELECT policy that allows viewing all users
CREATE POLICY "Public profiles viewable by all" ON public.users
  FOR SELECT USING (true);

-- Note: This allows everyone to view all users' basic profile info (name, avatar, level, xp)
-- This is necessary for leaderboards, user search, and social features
-- Update and Delete operations remain protected by separate policies

