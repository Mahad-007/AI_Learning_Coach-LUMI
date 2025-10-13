# Manual Testing Guide for Room Code Functionality

## Step 1: Verify Migration Applied

1. **Open your browser** and go to `http://localhost:8081`
2. **Open Developer Console** (F12)
3. **Run this command** to test if migration was applied:

```javascript
// Test if room_code column exists
supabase.from('whiteboard_sessions').select('room_code').limit(1).then(console.log);
```

**Expected Result**: Should return data without errors
**If Error**: Migration not applied - run the SQL from `APPLY_MIGRATION.sql`

## Step 2: Test Room Code Generation

1. **Navigate to Whiteboard page** in your app
2. **Click "Create Session"**
3. **Fill in the form**:
   - Title: "Test Session"
   - Topic: "Testing"
   - Check "Generate join code for friends"
4. **Click "Create Session"**
5. **Check console** for these messages:
   - "Generating room code..."
   - "Generated room code: [CODE]"
   - "Session created! Room Code: [CODE]"

**Expected Result**: Toast shows room code and it's copied to clipboard
**If Error**: Check console for specific error messages

## Step 3: Test Room Code Display

1. **Look at the session card** - should show the room code
2. **Click "Share Code"** button
3. **Should open dialog** with large room code display
4. **Click "Copy Code"** - should copy to clipboard

**Expected Result**: Dialog shows room code prominently
**If Error**: Check if session has room_code field

## Step 4: Test Joining by Code

1. **Open a new browser tab/window** (simulate friend)
2. **Navigate to Whiteboard page**
3. **Click "Join by Code"**
4. **Enter the room code** from Step 2
5. **Click "Join Session"**
6. **Check console** for these messages:
   - "Attempting to join session with code: [CODE]"
   - "Join session result: [SUCCESS]"

**Expected Result**: Successfully joins the session
**If Error**: Check console for specific error messages

## Step 5: Test Full Flow

1. **Create session with code** (as host)
2. **Share code with friend** (copy from dialog)
3. **Friend joins using code** (in different browser)
4. **Both should be in same session**

**Expected Result**: Both users can see each other in the session

## Troubleshooting

### Common Issues:

1. **"Session not found"**
   - Check if migration was applied
   - Verify room_code column exists

2. **"Function not found"**
   - Migration not applied
   - Run SQL from APPLY_MIGRATION.sql

3. **"User not authenticated"**
   - User not logged in
   - Check authentication setup

4. **"Permission denied"**
   - RLS policies not configured
   - Check migration applied correctly

### Debug Commands:

```javascript
// Check if user is authenticated
supabase.auth.getUser().then(console.log);

// Check if migration was applied
supabase.from('whiteboard_sessions').select('room_code, is_joinable').limit(1).then(console.log);

// Test room code generation
supabase.rpc('generate_whiteboard_session_code').then(console.log);

// Check existing sessions
supabase.from('whiteboard_sessions').select('*').then(console.log);
```

## Success Indicators:

✅ Room code generated when creating session
✅ Room code displayed in session card
✅ Share code dialog shows room code
✅ Can join session using room code
✅ Both users can see each other in session
