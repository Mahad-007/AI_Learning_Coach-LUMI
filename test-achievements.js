/**
 * Achievement System Diagnostic Script
 * Run this to check if badges in database match achievement registry
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Achievement registry (from achievementsRegistry.ts)
const achievementNames = [
  'First Steps',
  'Quiz Beginner',
  'Perfect Start',
  'Conversation Starter',
  'Level 5 Master',
  'Level 10 Master',
  'Level 25 Master',
  'Level 50 Master',
  'Level 100 Master',
  'XP Novice',
  'XP Apprentice',
  'XP Expert',
  'XP Virtuoso',
  'XP Legend',
  'Study Starter',
  'Knowledge Seeker',
  'Learning Enthusiast',
  'Century Scholar',
  'Wisdom Master',
  'Quiz Explorer',
  'Quiz Veteran',
  'Quiz Master',
  'Perfectionist',
  'Flawless Scholar',
  'Precision Master',
  'Almost Perfect',
  'Chat Enthusiast',
  'Conversationalist',
  'AI Companion',
  'Week Warrior',
  'Month Master',
  'Century Champion',
  'Year Legend',
  'Night Owl',
  'Early Bird',
  'Profile Pro',
  'Champion',
  'Top 10 Elite',
  'Well-Rounded Learner',
  'Welcome Aboard', // From authService.ts
];

async function diagnose() {
  console.log('🔍 Achievement System Diagnostic\n');
  
  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email')
    .limit(5);
    
  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('⚠️  No users found in database');
    return;
  }
  
  console.log(`📊 Found ${users.length} users (showing first 5)\n`);
  
  for (const user of users) {
    console.log(`\n👤 User: ${user.name} (${user.email})`);
    console.log(`   ID: ${user.id}`);
    
    // Get badges for this user
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id);
      
    if (badgesError) {
      console.error(`   ❌ Error fetching badges:`, badgesError);
      continue;
    }
    
    if (!badges || badges.length === 0) {
      console.log(`   ℹ️  No badges found`);
      continue;
    }
    
    console.log(`   🏆 Badges: ${badges.length}`);
    
    // Check each badge
    for (const badge of badges) {
      const normalizedBadgeName = badge.badge_name.toLowerCase().trim();
      const matchesRegistry = achievementNames.some(
        name => name.toLowerCase().trim() === normalizedBadgeName
      );
      
      const status = matchesRegistry ? '✓' : '✗';
      console.log(`      ${status} ${badge.badge_name} (${badge.badge_type})`);
      
      if (!matchesRegistry) {
        console.log(`         ⚠️  NOT IN REGISTRY - won't show in UI!`);
      }
    }
    
    // Show missing achievements
    const earnedNames = badges.map(b => b.badge_name.toLowerCase().trim());
    const missingAchievements = achievementNames.filter(
      name => !earnedNames.includes(name.toLowerCase().trim())
    );
    
    if (missingAchievements.length > 0) {
      console.log(`\n   📋 Missing achievements (${missingAchievements.length}):`);
      console.log(`      ${missingAchievements.slice(0, 5).join(', ')}...`);
    }
  }
  
  console.log('\n\n✅ Diagnostic complete!');
  console.log('\nTroubleshooting tips:');
  console.log('1. Badge names in DB must exactly match achievement registry names');
  console.log('2. Check for extra spaces, different capitalization');
  console.log('3. Badges marked with ✗ won\'t appear in the UI');
  console.log('4. Run this script after earning badges to verify they match\n');
}

diagnose().catch(console.error);

