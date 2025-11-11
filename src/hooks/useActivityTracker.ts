import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InactivityService } from '@/services/inactivityService';

export const useActivityTracker = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Update activity on various user interactions
    const updateActivity = () => {
      InactivityService.updateLastActivity(user.id);
    };

    // Track common user activities
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Initial activity update
    updateActivity();

    // Set user as offline when page unloads
    const handleBeforeUnload = () => {
      InactivityService.setUserOffline(user.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set user as offline when component unmounts
      InactivityService.setUserOffline(user.id);
    };
  }, [user]);
};
