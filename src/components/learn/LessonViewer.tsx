import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedLessonService } from '@/services/enhancedLessonService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LessonContent } from './LessonContent';
import { TableOfContents } from './TableOfContents';
import { NotesPanel } from './NotesPanel';
import { QuizSection } from './QuizSection';
import { AISummaryPanel } from './AISummaryPanel';
import { PDFExportButton } from './PDFExportButton';
import { XPPopup } from './XPPopup';
import {
  X,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  StickyNote,
  Sparkles,
} from 'lucide-react';
import type { LessonWithProgress, UserNote, UserHighlight } from '@/types/lesson';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LessonViewerProps {
  lesson: LessonWithProgress;
  onClose: () => void;
}

export function LessonViewer({ lesson, onClose }: LessonViewerProps) {
  const { user } = useAuth();
  const [focusMode, setFocusMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [timeSpent, setTimeSpent] = useState(lesson.progress?.time_spent || 0);
  const [percentComplete, setPercentComplete] = useState(
    lesson.progress?.percent_complete || 0
  );
  const [maxProgress, setMaxProgress] = useState(
    lesson.progress?.percent_complete || 0
  );
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set());
  const [totalSections, setTotalSections] = useState(0);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [isCompleted, setIsCompleted] = useState(
    lesson.progress?.is_completed || false
  );
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpData, setXPData] = useState<{
    amount: number;
    newLevel: number;
    levelUp: boolean;
  } | null>(null);

  const heartbeatRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef(Date.now());
  const activeTimeRef = useRef(0);

  // Load notes and highlights
  useEffect(() => {
    if (user) {
      loadNotes();
      loadHighlights();
    }
  }, [user, lesson.id]);

  // Time tracking heartbeat
  useEffect(() => {
    const heartbeat = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      if (elapsed >= 15) {
        // Every 15 seconds
        activeTimeRef.current += elapsed;
        setTimeSpent((prev) => prev + elapsed);
        EnhancedLessonService.updateProgressTime(user!.id, lesson.id, elapsed);
        startTimeRef.current = now;
      }
    };

    heartbeatRef.current = setInterval(heartbeat, 15000);
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        // Final save on unmount
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed > 0) {
          EnhancedLessonService.updateProgressTime(user!.id, lesson.id, elapsed);
        }
      }
    };
  }, [user, lesson.id]);

  // Save progress when section or percent changes
  useEffect(() => {
    if (user && (currentSection || percentComplete > 0)) {
      EnhancedLessonService.updateProgress(
        user.id,
        lesson.id,
        currentSection,
        percentComplete,
        isCompleted
      );
    }
  }, [currentSection, percentComplete, isCompleted]);

  const loadNotes = async () => {
    try {
      const data = await EnhancedLessonService.getNotes(user!.id, lesson.id);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadHighlights = async () => {
    try {
      const data = await EnhancedLessonService.getHighlights(user!.id, lesson.id);
      setHighlights(data);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  };

  const handleSectionChange = (
    section: string, 
    newPercent: number, 
    visitedCount: number, 
    totalCount: number
  ) => {
    setCurrentSection(section);
    setTotalSections(totalCount);
    
    // Update visited sections
    setVisitedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(section);
      return newSet;
    });

    // Monotonic progress: only update if new progress is higher
    if (newPercent > maxProgress) {
      console.log(`[Progress] Section progress increased: ${maxProgress}% → ${newPercent}%`);
      
      // Only update database if progress increased by ≥5%
      if (newPercent - maxProgress >= 5) {
        console.log(`[Progress] Significant progress increase (${newPercent - maxProgress}%), updating database`);
        setMaxProgress(newPercent);
        setPercentComplete(newPercent);
        
        // Update database with new progress
        EnhancedLessonService.updateProgress(
          user!.id,
          lesson.id,
          section,
          newPercent,
          false
        ).catch(error => console.error('Failed to update progress:', error));
      } else {
        // Update local state but don't hit database yet
        setMaxProgress(newPercent);
        setPercentComplete(newPercent);
      }
    } else {
      console.log(`[Progress] New progress (${newPercent}%) ≤ max progress (${maxProgress}%), ignoring`);
    }
  };

  const handleAddNote = async (content: string, sectionAnchor?: string) => {
    try {
      const note = await EnhancedLessonService.saveNote(
        user!.id,
        lesson.id,
        null,
        content,
        sectionAnchor || null
      );
      setNotes((prev) => [note, ...prev]);
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await EnhancedLessonService.deleteNote(user!.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleAddHighlight = async (
    snippet: string,
    color: string,
    sectionAnchor?: string
  ) => {
    try {
      const highlight = await EnhancedLessonService.addHighlight(
        user!.id,
        lesson.id,
        snippet,
        color,
        sectionAnchor || null
      );
      setHighlights((prev) => [highlight, ...prev]);
      toast.success('Highlight added');
    } catch (error) {
      toast.error('Failed to add highlight');
    }
  };

  const handleDeleteHighlight = async (highlightId: string) => {
    try {
      await EnhancedLessonService.deleteHighlight(user!.id, highlightId);
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
      toast.success('Highlight deleted');
    } catch (error) {
      toast.error('Failed to delete highlight');
    }
  };

  const handleCompleteLesson = async () => {
    if (isCompleted) return;

    try {
      const result = await EnhancedLessonService.completeLesson(
        user!.id,
        lesson.id,
        timeSpent + Math.floor((Date.now() - startTimeRef.current) / 1000)
      );

      setIsCompleted(true);
      setPercentComplete(100);
      setMaxProgress(100); // Update max progress to 100%
      setXPData({
        amount: result.xpAwarded,
        newLevel: result.newLevel,
        levelUp: result.levelChanged,
      });
      setShowXPPopup(true);

      // Confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
      toast.success('Lesson completed! 🎉');
    } catch (error) {
      toast.error('Failed to complete lesson');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={cn('min-h-screen', focusMode ? 'pt-4' : 'pt-20')}>
      {/* Header */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-semibold truncate">{lesson.topic}</h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{lesson.difficulty}</span>
                      <span>•</span>
                      <span>{formatTime(timeSpent)} spent</span>
                      <span>•</span>
                      <span>{percentComplete}% complete (visited: {visitedSections.size}/{totalSections})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className="gap-2"
                  >
                    <StickyNote className="w-4 h-4" />
                    <span className="hidden sm:inline">Notes</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusMode(!focusMode)}
                    className="gap-2"
                  >
                    {focusMode ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Focus</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => EnhancedLessonService.checkAndAwardMissingBadges(user!.id)}
                    className="gap-2"
                    title="Check and award missing badges"
                  >
                    🏆
                    <span className="hidden sm:inline">Check Badges</span>
                  </Button>
                  {!isCompleted && (
                    <Button onClick={handleCompleteLesson} className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Complete</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <Progress value={percentComplete} className="h-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'container mx-auto px-4',
          focusMode ? 'max-w-5xl pt-8' : 'max-w-7xl',
          !focusMode && 'pt-32'
        )}
      >
        {focusMode ? (
          /* Focus Mode - Centered Layout */
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <Card className="p-6 lg:p-8 shadow-2xl border-primary/20">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    Focus Mode
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusMode(false)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Exit Focus Mode
                  </Button>
                </div>

                <LessonContent
                  lesson={lesson}
                  onSectionChange={handleSectionChange}
                  onAddHighlight={handleAddHighlight}
                  highlights={highlights}
                  focusMode={focusMode}
                />

                {/* Inline Quizzes */}
                <div className="mt-8">
                  <QuizSection lesson={lesson} />
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Normal Mode - Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table of Contents */}
            <div className="lg:col-span-3">
              <div className="sticky top-36 space-y-4">
                <TableOfContents
                  content={lesson.content}
                  currentSection={currentSection}
                  onSectionClick={setCurrentSection}
                />
                <Card className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {lesson.estimated_minutes || lesson.duration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {lesson.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSummary(!showSummary)}
                      className="w-full gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Summary
                    </Button>
                    <PDFExportButton
                      lesson={lesson}
                      notes={notes}
                      highlights={highlights}
                    />
                  </div>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <Card className="p-6 lg:p-8">
                <LessonContent
                  lesson={lesson}
                  onSectionChange={handleSectionChange}
                  onAddHighlight={handleAddHighlight}
                  highlights={highlights}
                  focusMode={focusMode}
                />

                {/* Inline Quizzes */}
                <div className="mt-8">
                  <QuizSection lesson={lesson} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Notes Panel (Slide-in) */}
      <NotesPanel
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        highlights={highlights}
        onDeleteHighlight={handleDeleteHighlight}
      />

      {/* AI Summary Panel */}
      <AISummaryPanel
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        lesson={lesson}
      />

      {/* XP Popup */}
      {showXPPopup && xpData && (
        <XPPopup
          xpAmount={xpData.amount}
          newLevel={xpData.newLevel}
          levelUp={xpData.levelUp}
          onClose={() => setShowXPPopup(false)}
        />
      )}
    </div>
  );
}

