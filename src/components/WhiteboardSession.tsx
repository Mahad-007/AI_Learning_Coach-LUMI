import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Users, 
  Clock, 
  Settings, 
  Play, 
  Edit, 
  Trash2,
  Share2,
  Facebook,
  Globe,
  Wand2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WhiteboardService } from '@/services/whiteboardService';
import { Whiteboard } from './Whiteboard';
import type { WhiteboardSession, WhiteboardSettings } from '@/types/whiteboard';
import { toast } from 'sonner';

export const WhiteboardSessionComponent: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WhiteboardSession[]>([]);
  const [activeSession, setActiveSession] = useState<WhiteboardSession | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Create session form
  const [newSession, setNewSession] = useState({
    title: '',
    topic: '',
    max_participants: 10,
    generateCode: false, // New field for code generation
    settings: {
      allow_drawing: true,
      allow_text: true,
      allow_shapes: true,
      allow_images: true,
      ai_assistant_enabled: true,
      recording_enabled: false
    } as WhiteboardSettings
  });

  // Invite form
  const [inviteData, setInviteData] = useState({
    invitationType: 'global' as 'global' | 'facebook',
    message: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      console.log('Loading sessions...');
      const userSessions = await WhiteboardService.getUserSessions();
      console.log('Loaded sessions:', userSessions);
      console.log('Sessions count:', userSessions.length);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSession.title.trim() || !newSession.topic.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('Creating session with:', newSession);
      const session = await WhiteboardService.createSession(newSession);
      console.log('Session created successfully:', session);
      
      // Reload sessions to get the latest data
      await loadSessions();
      setShowCreateDialog(false);
      
      // Show success message with room code if generated
      if (session.roomCode) {
        toast.success(
          `Session created! Room Code: ${session.roomCode}`,
          { 
            description: "Share this code with your friends to let them join",
            duration: 8000
          }
        );
        // Also copy the code to clipboard
        navigator.clipboard.writeText(session.roomCode);
      } else {
        toast.success('Session created successfully!');
      }
      
      setNewSession({
        title: '',
        topic: '',
        max_participants: 10,
        generateCode: false,
        settings: {
          allow_drawing: true,
          allow_text: true,
          allow_shapes: true,
          allow_images: true,
          ai_assistant_enabled: true,
          recording_enabled: false
        }
      });
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create session');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      console.log('Joining session:', sessionId);
      await WhiteboardService.joinSession(sessionId);
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setActiveSession(session);
        toast.success('Joined session successfully!');
      }
    } catch (error: any) {
      console.error('Error joining session:', error);
      if (error.code === '23505') {
        // User is already a participant, just open the session
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          setActiveSession(session);
          toast.success('Opening session...');
        }
      } else {
        toast.error(error.message || 'Failed to join session');
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await WhiteboardService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session deleted successfully!');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const handleInviteFriends = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session?.room_code) {
        // Show a more prominent dialog with the room code
        setShowInviteDialog(true);
        // Set the active session for the invite dialog
        setActiveSession(session);
      } else {
        // Fallback to the original invitation system
        await WhiteboardService.inviteFriend({
          sessionId,
          invitationType: 'global'
        });
        toast.success('Invitations sent successfully!');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    }
  };

  const handleLearnWithAI = async (sessionId: string, topic: string) => {
    try {
      // Generate AI content for the session
      const aiContent = await WhiteboardService.generateTeachingContent(topic, sessionId);
      
      // Add AI-generated elements to the session
      for (const element of aiContent.elements) {
        await WhiteboardService.addElement(sessionId, element as any);
      }
      
      toast.success(`AI has generated teaching content for "${topic}"!`);
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a session code');
      return;
    }

    setIsJoining(true);
    try {
      const { session, participant } = await WhiteboardService.joinSessionByCode(joinCode.toUpperCase());
      setActiveSession(session);
      setShowJoinDialog(false);
      setJoinCode('');
      toast.success(`Joined "${session.title}" successfully!`);
    } catch (error: any) {
      console.error('Error joining session by code:', error);
      toast.error(error.message || 'Failed to join session');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodes(prev => new Set(prev).add(code));
    toast.success('Session code copied!');
    setTimeout(() => {
      setCopiedCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(code);
        return newSet;
      });
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (activeSession) {
    return (
      <Whiteboard 
        sessionId={activeSession.id} 
        sessionTitle={activeSession.title}
        sessionTopic={activeSession.topic}
        onClose={() => setActiveSession(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Interactive Whiteboard</h1>
            <p className="text-muted-foreground">Create collaborative learning sessions with AI assistance</p>
            {/* Debug info removed */}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadSessions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Join by Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Join Whiteboard Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="joinCode">Session Code</Label>
                    <Input
                      id="joinCode"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-character code (e.g., 7XK3P)"
                      maxLength={6}
                      className="text-center text-xl font-bold tracking-widest uppercase"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleJoinByCode}
                      disabled={isJoining || joinCode.length < 5}
                    >
                      {isJoining ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Session'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter session title"
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={newSession.topic}
                    onChange={(e) => setNewSession(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="What will you teach?"
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Select
                    value={newSession.max_participants.toString()}
                    onValueChange={(value) => setNewSession(prev => ({ ...prev, max_participants: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newSession.generateCode}
                      onChange={(e) => setNewSession(prev => ({ ...prev, generateCode: e.target.checked }))}
                    />
                    <span className="text-sm font-medium">Generate join code for friends</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Creates a 6-character code that friends can use to join your session
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Session Settings</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newSession.settings.allow_drawing}
                        onChange={(e) => setNewSession(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allow_drawing: e.target.checked }
                        }))}
                      />
                      <span className="text-sm">Allow Drawing</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newSession.settings.allow_text}
                        onChange={(e) => setNewSession(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allow_text: e.target.checked }
                        }))}
                      />
                      <span className="text-sm">Allow Text</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newSession.settings.allow_shapes}
                        onChange={(e) => setNewSession(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allow_shapes: e.target.checked }
                        }))}
                      />
                      <span className="text-sm">Allow Shapes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newSession.settings.ai_assistant_enabled}
                        onChange={(e) => setNewSession(prev => ({
                          ...prev,
                          settings: { ...prev.settings, ai_assistant_enabled: e.target.checked }
                        }))}
                      />
                      <span className="text-sm">AI Assistant</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>
                    Create Session
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <Badge variant={session.is_active ? 'default' : 'secondary'}>
                      {session.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.topic}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {session.current_participants}/{session.max_participants} participants
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(session.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">Host:</span>
                      <span className="font-medium">{session.host_name}</span>
                    </div>
                    
                    {session.room_code && (
                      <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Join Code:</span>
                          <span className="ml-2 font-bold text-lg tracking-widest text-foreground">{session.room_code}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(session.room_code!)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCodes.has(session.room_code!) ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinSession(session.id)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Join Session
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleLearnWithAI(session.id, session.topic)}
                        >
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInviteFriends(session.id)}
                          className="flex-1"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {session.room_code ? 'Share Code' : 'Add Friends'}
                        </Button>
                        {session.host_id === user?.id && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-4">Create your first interactive whiteboard session to start teaching!</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Session
            </Button>
          </div>
        )}

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Session Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {activeSession?.room_code ? (
                <>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Share this code with your friends to let them join your whiteboard session:
                    </p>
                    <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-border">
                      <p className="text-xs text-muted-foreground mb-2">Session Code</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-bold tracking-widest text-foreground">
                          {activeSession.room_code}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(activeSession.room_code!)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCodes.has(activeSession.room_code!) ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Friends can use the "Join by Code" button to enter this code
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      navigator.clipboard.writeText(activeSession.room_code!);
                      toast.success('Code copied to clipboard!');
                    }}>
                      Copy Code
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Invitation Type</Label>
                    <Select
                      value={inviteData.invitationType}
                      onValueChange={(value: 'global' | 'facebook') => 
                        setInviteData(prev => ({ ...prev, invitationType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Global Search
                          </div>
                        </SelectItem>
                        <SelectItem value="facebook">
                          <div className="flex items-center">
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook Friends
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Invitation Message</Label>
                    <Textarea
                      id="message"
                      value={inviteData.message}
                      onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Add a personal message..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleInviteFriends(activeSession?.id || '')}>
                      Send Invitations
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WhiteboardSessionComponent;
