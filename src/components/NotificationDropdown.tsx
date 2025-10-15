import React, { useState, useEffect } from 'react';
import { Bell, Users, Trophy, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationsService, AppNotification } from '@/services/notificationsService';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkRead(notification.id)}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-3 h-3" />
          </Button>
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
  const { user } = useAuth();

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
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
