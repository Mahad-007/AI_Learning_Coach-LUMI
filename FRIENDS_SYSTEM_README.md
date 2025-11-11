# Friends System Implementation

## Overview
A complete friends and invitation system with email notifications using NodeMailer and Gmail App Password.

## Features Implemented

### 1. Database Schema
- **friend_requests**: Tracks friend requests with status (pending/accepted/declined/cancelled)
- **friends**: Stores mutual friendships (undirected)
- **Unique constraints**: Prevents duplicate requests
- **RLS policies**: Secure access control

### 2. Email Service (NodeMailer + Express)
- **Server**: `src/server/emailServer.ts`
- **Endpoints**:
  - `POST /send-friend-request` - Notifies existing users about friend requests
  - `POST /send-invite` - Sends invitations to non-users
- **Gmail Integration**: Uses App Password for authentication

### 3. Frontend Service
- **File**: `src/services/friendsService.ts`
- **Methods**:
  - `searchByEmailOrUsername()` - Find users by email/username
  - `checkFriendshipStatus()` - Check if users are friends or have pending requests
  - `sendFriendRequest()` - Send friend request with validation
  - `respond()` - Accept/decline friend requests
  - `cancelRequest()` - Cancel sent requests
  - `listFriends()` - Get user's friends list
  - `listRequests()` - Get sent/received requests

### 4. UI Components
- **Page**: `src/pages/Friends.tsx`
- **Features**:
  - Search by email or username
  - Display friendship status (already friends, pending, declined)
  - Send friend requests or invitations
  - Manage received/sent requests
  - View friends list
  - Toast notifications for all actions

## Setup Instructions

### 1. Environment Variables
Create `.env.local` (frontend):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAIL_SERVER_URL=http://localhost:4001
```

Create `.env` (email server):
```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_google_app_password
EMAIL_SERVER_PORT=4001
```

### 2. Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this password in `GMAIL_APP_PASSWORD`

### 3. Running the System

#### Start Email Server
```bash
npm run email:dev
# or
npx ts-node src/server/emailServer.ts
```

#### Start Frontend
```bash
npm run dev
```

## User Flow

### For Existing Users
1. User searches by email/username
2. If found: Shows "Send Friend Request" button
3. On click: Creates friend request + sends email notification
4. Receiver gets email with link to `/friends` page
5. Receiver can accept/decline from the app

### For Non-Users
1. User searches by email/username
2. If not found: Shows "Send Invitation" button
3. On click: Sends invitation email with signup link
4. Invited person can sign up and connect

## Error Handling

The system now properly handles:
- **409 Conflict**: When trying to send duplicate requests
- **Already Friends**: Shows "Already Friends" status
- **Pending Requests**: Shows "Request Pending" status
- **Declined Requests**: Allows resending after decline

## Database Functions

- `accept_friend_request(req_id)`: Creates mutual friendship rows when request is accepted
- RLS policies ensure users can only manage their own requests and friendships

## Navigation

- Added "Friends" link to main navigation
- Route: `/friends` (protected)

## Email Templates

Both friend request and invitation emails include:
- Personalized sender name
- Professional styling
- Clear call-to-action buttons
- Fallback text links

## Security Features

- RLS policies on all tables
- Users can only cancel their own sent requests
- Users can only respond to requests sent to them
- Unique constraints prevent duplicate requests
- Email validation and sanitization
