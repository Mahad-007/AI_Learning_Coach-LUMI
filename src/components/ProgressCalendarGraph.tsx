import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  TrendingUp, 
  Flame, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { ProgressTrackingService, type ProgressCalendarData, type DailyProgress } from '@/services/progressTrackingService';
import { useAuth } from '@/contexts/AuthContext';

interface ProgressCalendarGraphProps {
  className?: string;
}

const ProgressCalendarGraph: React.FC<ProgressCalendarGraphProps> = ({ className }) => {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load data for the entire year to avoid reloading on month navigation
      const startDate = new Date(currentMonth.getFullYear(), 0, 1);
      const endDate = new Date(currentMonth.getFullYear(), 11, 31);
      
      const progressData = await ProgressTrackingService.getProgressCalendarData(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setData(progressData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityLevel = (day: DailyProgress): 'none' | 'low' | 'medium' | 'high' | 'very-high' => {
    if (day.activity_count === 0) return 'none';
    if (day.activity_count <= 2) return 'low';
    if (day.activity_count <= 5) return 'medium';
    if (day.activity_count <= 10) return 'high';
    return 'very-high';
  };

  const getActivityColor = (level: string): string => {
    switch (level) {
      case 'none': return 'bg-muted/20';
      case 'low': return 'bg-green-200 dark:bg-green-900/30';
      case 'medium': return 'bg-green-400 dark:bg-green-700/50';
      case 'high': return 'bg-green-600 dark:bg-green-600/70';
      case 'very-high': return 'bg-green-800 dark:bg-green-500';
      default: return 'bg-muted/20';
    }
  };

  const getDayOfWeek = (date: string): number => {
    return new Date(date).getDay();
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSelectedDayData = (): DailyProgress | null => {
    if (!selectedDate || !data) return null;
    return data.daily_progress.find(day => day.date === selectedDate) || null;
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading progress data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
          <p className="text-muted-foreground">Start learning to see your progress calendar!</p>
        </div>
      </Card>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const selectedDayData = getSelectedDayData();

  return (
    <Card className={`p-4 ${className}`}>
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Progress Calendar</h3>
            <p className="text-xs text-muted-foreground">Learning activity over time</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs font-medium min-w-[100px] text-center">
            {formatMonthYear(currentMonth)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Stats Summary - Very Compact */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-sm font-bold text-primary">{data.active_days}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-blue-600">{data.total_xp.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-purple-600">{data.total_lessons}</div>
          <div className="text-xs text-muted-foreground">Lessons</div>
        </div>
      </div>

      {/* Calendar Grid - Very Compact */}
      <div className="mb-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty days for first week */}
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="aspect-square"></div>
          ))}
          
          {/* Actual days */}
          {monthDays.map(day => {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = data.daily_progress.find(d => d.date === dateStr);
            const activityLevel = dayData ? getActivityLevel(dayData) : 'none';
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  aspect-square rounded-sm border transition-all duration-200 hover:scale-105
                  ${getActivityColor(activityLevel)}
                  ${isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-transparent'}
                  ${isToday ? 'ring-1 ring-blue-500/50' : ''}
                  ${dayData && dayData.activity_count > 0 ? 'cursor-pointer' : 'cursor-default'}
                `}
                title={dayData ? `${dayData.activity_count} activities` : 'No activity'}
              >
                <div className="flex flex-col items-center justify-center h-full text-xs">
                  <span className={`font-medium text-xs ${isToday ? 'text-blue-600' : ''}`}>
                    {day}
                  </span>
                  {dayData && dayData.activity_count > 0 && (
                    <div className="w-0.5 h-0.5 rounded-full bg-white/60"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details - Very Compact */}
      {selectedDayData && (
        <div className="border-t pt-2">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium">
              {new Date(selectedDate!).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {selectedDayData.xp_gained > 0 && (
              <div className="flex items-center gap-1 p-1 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                <div className="font-medium">+{selectedDayData.xp_gained}</div>
              </div>
            )}
            
            {selectedDayData.lessons_completed > 0 && (
              <div className="flex items-center gap-1 p-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                <BookOpen className="w-2.5 h-2.5 text-blue-600" />
                <div className="font-medium">{selectedDayData.lessons_completed}</div>
              </div>
            )}
            
            {selectedDayData.quizzes_taken > 0 && (
              <div className="flex items-center gap-1 p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                <Trophy className="w-2.5 h-2.5 text-purple-600" />
                <div className="font-medium">{selectedDayData.quizzes_taken}</div>
              </div>
            )}
            
            {selectedDayData.chat_messages > 0 && (
              <div className="flex items-center gap-1 p-1 bg-orange-50 dark:bg-orange-900/20 rounded text-xs">
                <MessageSquare className="w-2.5 h-2.5 text-orange-600" />
                <div className="font-medium">{selectedDayData.chat_messages}</div>
              </div>
            )}
            
            {selectedDayData.badges_earned > 0 && (
              <div className="flex items-center gap-1 p-1 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                <Flame className="w-2.5 h-2.5 text-yellow-600" />
                <div className="font-medium">{selectedDayData.badges_earned}</div>
              </div>
            )}
            
            {selectedDayData.study_time_minutes > 0 && (
              <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-900/20 rounded text-xs">
                <Clock className="w-2.5 h-2.5 text-gray-600" />
                <div className="font-medium">{selectedDayData.study_time_minutes}m</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend - Very Compact */}
      <div className="mt-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Activity</span>
          <div className="flex items-center gap-0.5">
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded bg-muted/20"></div>
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded bg-green-200 dark:bg-green-900/30"></div>
              <span className="text-xs">1-2</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded bg-green-400 dark:bg-green-700/50"></div>
              <span className="text-xs">3-5</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded bg-green-600 dark:bg-green-600/70"></div>
              <span className="text-xs">6-10</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded bg-green-800 dark:bg-green-500"></div>
              <span className="text-xs">10+</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressCalendarGraph;
