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
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WhiteboardService } from '@/services/whiteboardService';
import { Whiteboard } from './Whiteboard';
import type { WhiteboardSession, WhiteboardSettings } from '@/types/whiteboard';
import { toast } from 'sonner';

export const WhiteboardSession: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WhiteboardSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WhiteboardSession | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create session form
  const [newSession, setNewSession] = useState({
    title: '',
    topic: '',
    max_participants: 10,
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
      const userSessions = await WhiteboardService.getUserSessions();
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
      const session = await WhiteboardService.createSession(newSession);
      setSessions(prev => [session, ...prev]);
      setShowCreateDialog(false);
      setNewSession({
        title: '',
        topic: '',
        max_participants: 10,
        settings: {
          allow_drawing: true,
          allow_text: true,
          allow_shapes: true,
          allow_images: true,
          ai_assistant_enabled: true,
          recording_enabled: false
        }
      });
      toast.success('Session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      await WhiteboardService.joinSession(sessionId);
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
      toast.success('Joined session successfully!');
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
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

  const handleInviteFriends = async () => {
    if (!currentSession) return;

    try {
      await WhiteboardService.inviteFriend({
        sessionId: currentSession.id,
        invitationType: inviteData.invitationType
      });
      setShowInviteDialog(false);
      toast.success('Invitations sent successfully!');
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    }
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

  if (currentSession) {
    return (
      <Whiteboard 
        sessionId={currentSession.id} 
        sessionTitle={currentSession.title}
        sessionTopic={currentSession.topic}
        onClose={() => setCurrentSession(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Interactive Whiteboard</h1>
          <p className="text-gray-600">Create collaborative learning sessions with AI assistance</p>
        </div>
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <p className="text-sm text-gray-600">{session.topic}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {session.current_participants}/{session.max_participants} participants
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDate(session.created_at)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">Host:</span>
                    <span className="font-medium">{session.host_name}</span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinSession(session.id)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <Share2 className="h-4 w-4" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {sessions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
          <p className="text-gray-500 mb-4">Create your first interactive whiteboard session to start teaching!</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Session
          </Button>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Button onClick={handleInviteFriends}>
                Send Invitations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
