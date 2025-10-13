// Test script to verify the SQL function is working
// Run this in your browser console after applying the SQL fix

async function testJoinFunction() {
  console.log('🧪 Testing join function...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Test with a non-existent code (should return "Session not found" error, not ambiguous column error)
    const { data, error } = await supabase.rpc('join_whiteboard_session_by_code', {
      session_code: 'FAKE99',
      user_id_param: user.id,
      user_name_param: 'Test User',
      user_avatar_param: null,
      role_param: 'student'
    });
    
    console.log('Function test result:', { data, error });
    
    if (error) {
      if (error.code === '42702') {
        console.error('❌ Ambiguous column reference still exists!');
        console.log('💡 Please run the complete SQL fix from complete-sql-fix.sql');
        return false;
      } else if (error.message.includes('Session not found')) {
        console.log('✅ Function works correctly (expected error for non-existent code)');
        return true;
      } else {
        console.error('❌ Unexpected error:', error);
        return false;
      }
    } else {
      console.log('✅ Function works correctly');
      return true;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testJoinFunction().then(success => {
  if (success) {
    console.log('🎉 Join function is working correctly!');
    console.log('📝 You can now test the full room code functionality.');
  } else {
    console.log('⚠️ Join function needs to be fixed.');
    console.log('💡 Apply the SQL fix from complete-sql-fix.sql');
  }
});
