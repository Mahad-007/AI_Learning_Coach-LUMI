// Complete Test Script for Room Code Functionality
// Run this in your browser console at http://localhost:8081

console.log('🧪 Testing Complete Room Code Functionality...');

async function runCompleteTest() {
  try {
    // Test 1: Check if user is authenticated
    console.log('1️⃣ Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ User not authenticated. Please log in first.');
      return false;
    }
    console.log('✅ User authenticated:', user.email);
    
    // Test 2: Check if migration was applied
    console.log('2️⃣ Checking migration...');
    const { data: testSessions, error: schemaError } = await supabase
      .from('whiteboard_sessions')
      .select('room_code, is_joinable')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Migration not applied:', schemaError);
      return false;
    }
    console.log('✅ Migration applied - room_code column exists');
    
    // Test 3: Test room code generation function
    console.log('3️⃣ Testing room code generation...');
    const { data: testCode, error: functionError } = await supabase.rpc('generate_whiteboard_session_code');
    if (functionError) {
      console.error('❌ Room code generation function error:', functionError);
      return false;
    }
    console.log('✅ Room code generation works. Test code:', testCode);
    
    // Test 4: Test the fixed join function
    console.log('4️⃣ Testing join function (dry run)...');
    // We'll test with a non-existent code to see if the function works
    const { data: joinTest, error: joinError } = await supabase.rpc('join_whiteboard_session_by_code', {
      session_code: 'TEST99',
      user_id_param: user.id,
      user_name_param: 'Test User',
      user_avatar_param: null,
      role_param: 'student'
    });
    
    if (joinError && joinError.code === '42702') {
      console.error('❌ Ambiguous column reference still exists:', joinError);
      return false;
    } else if (joinError && joinError.message.includes('Session not found')) {
      console.log('✅ Join function works (expected error for non-existent code)');
    } else if (joinError) {
      console.error('❌ Unexpected join function error:', joinError);
      return false;
    } else {
      console.log('✅ Join function works');
    }
    
    console.log('🎉 All tests passed! Room code functionality is ready.');
    console.log('📝 You can now:');
    console.log('   1. Create sessions with room codes');
    console.log('   2. Share codes with friends');
    console.log('   3. Join sessions using codes');
    console.log('');
    console.log('🚀 Try creating a session with "Generate join code for friends" checked!');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the complete test
runCompleteTest().then(success => {
  if (success) {
    console.log('✅ Ready to test the full functionality!');
  } else {
    console.log('⚠️ Some issues found. Check the error messages above.');
  }
});
