import React, { useState, useEffect } from 'react';
import { Bell, Users, Trophy, Clock, X, Trash2, CheckCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationsService, AppNotification } from '@/services/notificationsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onDelete }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'friend_request_accepted':
        return <Users className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'trivia_invite':
        return <Trophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
      case 'inactivity_reminder':
        return <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getNotificationMessage = (notification: AppNotification) => {
    const { type, payload } = notification;
    
    switch (type) {
      case 'friend_request':
        return `${payload.from_user_name} ${payload.message}`;
      case 'friend_request_accepted':
        return `${payload.from_user_name} ${payload.message}`;
      case 'trivia_invite':
        return `${payload.from_name} invited you to a trivia battle!`;
      case 'inactivity_reminder':
        return payload.message;
      default:
        return 'You have a new notification';
    }
  };

  const getNotificationAction = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'View Friends';
      case 'friend_request_accepted':
        return 'View Friends';
      case 'trivia_invite':
        return 'Join Battle';
      case 'inactivity_reminder':
        return 'Continue Learning';
      default:
        return 'View';
    }
  };

  return (
    <Card className={`p-4 mb-2 transition-colors ${
      !notification.read_at 
        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
        : 'bg-muted/50 dark:bg-muted/20 border-border'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getNotificationIcon(notification.type)}
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {getNotificationMessage(notification)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!notification.read_at && (
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          )}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Mark as read"
            >
              <X className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Delete notification"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await NotificationsService.list(20);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationsService.markRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await NotificationsService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationsService.markAllRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      await NotificationsService.clearAll();
      setNotifications([]);
      setShowClearConfirm(false);
      toast({
        title: "All notifications cleared",
        description: "All notifications have been removed.",
      });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear all notifications.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-background dark:bg-background rounded-lg shadow-lg border border-border z-50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex-1"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
        ) : (
          <div className="p-2">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <Card className="p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Clear All Notifications</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete all your notifications. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={clearAllNotifications}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
