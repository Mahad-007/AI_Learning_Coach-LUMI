# Manual Testing Steps for Room Code Functionality

## 🧪 **Step-by-Step Testing Guide**

### **Step 1: Run Console Test**
1. **Open your browser** and go to `http://localhost:8081`
2. **Open Developer Console** (F12)
3. **Copy and paste** the contents of `complete-test.js` into the console
4. **Press Enter** to run the test
5. **Look for** ✅ checkmarks - all tests should pass

### **Step 2: Test Session Creation with Room Code**
1. **Navigate to Whiteboard page** in your app
2. **Click "Create Session"**
3. **Fill in the form**:
   - Title: "Test Room Code Session"
   - Topic: "Testing"
   - **Check "Generate join code for friends"** ✅
4. **Click "Create Session"**
5. **Expected Results**:
   - Toast shows: "Session created! Room Code: [CODE]"
   - Code is automatically copied to clipboard
   - Console shows: "Generated room code: [CODE]"

### **Step 3: Test Room Code Display**
1. **Look at the session card** - should show the room code in a gray box
2. **Click "Share Code"** button (should say "Share Code" not "Add Friends")
3. **Expected Results**:
   - Dialog opens with large room code display
   - Code is prominently shown in large text
   - Copy button is available

### **Step 4: Test Joining by Code**
1. **Open a new browser tab/window** (simulate friend)
2. **Navigate to Whiteboard page**
3. **Click "Join by Code"**
4. **Enter the room code** from Step 2
5. **Click "Join Session"**
6. **Expected Results**:
   - Console shows: "Attempting to join session with code: [CODE]"
   - Console shows: "Join session result: [SUCCESS DATA]"
   - Toast shows: "Joined [SESSION TITLE] successfully!"
   - Session opens automatically

### **Step 5: Test Full Flow**
1. **Create session with code** (as host)
2. **Share code with friend** (copy from dialog)
3. **Friend joins using code** (in different browser)
4. **Both should be in same session**

## 🔍 **What to Look For**

### **Success Indicators:**
- ✅ Room code generated when creating session
- ✅ Room code displayed in session card
- ✅ Share code dialog shows room code prominently
- ✅ Can join session using room code
- ✅ No "ambiguous column reference" errors
- ✅ Both users can see each other in session

### **Console Messages to Watch:**
```
✅ "Generating room code..."
✅ "Generated room code: [CODE]"
✅ "Attempting to join session with code: [CODE]"
✅ "Join session result: [SUCCESS DATA]"
```

### **Error Messages to Avoid:**
```
❌ "column reference 'session_id' is ambiguous"
❌ "Function not found"
❌ "Session not found or not joinable"
❌ "User not authenticated"
```

## 🚨 **Troubleshooting**

### **If you see "ambiguous column reference":**
- The SQL fix wasn't applied correctly
- Re-run the SQL from `fix-sql-function.sql`

### **If you see "Function not found":**
- Migration wasn't applied
- Run the SQL from `supabase/migrations/add_whiteboard_session_codes.sql`

### **If you see "Session not found":**
- Check if the session was created with a room code
- Verify the room code is correct (case-sensitive)

### **If you see "User not authenticated":**
- Make sure you're logged in
- Check authentication setup

## 🎯 **Quick Test Commands**

Run these in your browser console:

```javascript
// Test authentication
supabase.auth.getUser().then(console.log);

// Test migration
supabase.from('whiteboard_sessions').select('room_code, is_joinable').limit(1).then(console.log);

// Test room code generation
supabase.rpc('generate_whiteboard_session_code').then(console.log);

// Test join function (with fake code)
supabase.rpc('join_whiteboard_session_by_code', {
  session_code: 'FAKE99',
  user_id_param: '00000000-0000-0000-0000-000000000000',
  user_name_param: 'Test',
  role_param: 'student'
}).then(console.log);
```

## ✅ **Final Verification**

After completing all steps, you should be able to:
1. **Create sessions** with room codes
2. **Share codes** with friends easily
3. **Join sessions** using codes
4. **Collaborate** in real-time whiteboard sessions

The room code functionality should now work exactly like the trivia system!
