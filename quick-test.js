// Quick Test Script for Room Code Functionality
// Run this in your browser console at http://localhost:8081

console.log('🧪 Testing Room Code Functionality...');

// Test 1: Check if migration was applied
supabase.from('whiteboard_sessions').select('room_code, is_joinable').limit(1)
  .then(result => {
    if (result.error) {
      console.error('❌ Migration not applied:', result.error);
      console.log('💡 Please run the SQL migration in your Supabase dashboard');
      return;
    }
    console.log('✅ Migration applied - room_code column exists');
    
    // Test 2: Check if functions are available
    return supabase.rpc('generate_whiteboard_session_code');
  })
  .then(result => {
    if (result.error) {
      console.error('❌ Function not available:', result.error);
      return;
    }
    console.log('✅ Room code generation function works. Test code:', result.data);
    console.log('🎉 All tests passed! Room code functionality should work.');
    console.log('📝 You can now:');
    console.log('   1. Create sessions with room codes');
    console.log('   2. Share codes with friends');
    console.log('   3. Join sessions using codes');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
