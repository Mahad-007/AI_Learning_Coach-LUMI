import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedLessonService } from '@/services/enhancedLessonService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Sparkles, Loader2 } from 'lucide-react';
import type { Lesson, GeneratedSummary } from '@/types/lesson';
import { toast } from 'sonner';

interface AISummaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
}

export function AISummaryPanel({ isOpen, onClose, lesson }: AISummaryPanelProps) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<GeneratedSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSummary();
    }
  }, [isOpen, user, lesson.id]);

  const loadSummary = async () => {
    try {
      const existingSummary = await EnhancedLessonService.getSummary(
        user!.id,
        lesson.id
      );
      if (existingSummary) {
        setSummary(existingSummary);
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const generateSummary = async () => {
    try {
      setLoading(true);
      const newSummary = await EnhancedLessonService.generateSummary(
        user!.id,
        lesson.id,
        lesson.content
      );
      setSummary(newSummary);
      toast.success('Summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const regenerateSummary = async () => {
    try {
      setLoading(true);
      const newSummary = await EnhancedLessonService.regenerateSummary(
        user!.id,
        lesson.id,
        lesson.content
      );
      setSummary(newSummary);
      toast.success('Summary regenerated!');
    } catch (error) {
      toast.error('Failed to regenerate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-full sm:w-[500px] bg-background border-r shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">AI Summary</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get a concise AI-generated summary of this lesson
                </p>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Generating summary...
                      </p>
                    </div>
                  ) : summary ? (
                    <Card className="p-4">
                      <article className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {summary.summary_content}
                        </ReactMarkdown>
                      </article>
                    </Card>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">No summary yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Generate an AI summary to get the key takeaways and main
                          concepts from this lesson.
                        </p>
                        <Button onClick={generateSummary} className="gap-2">
                          <Sparkles className="w-4 h-4" />
                          Generate Summary
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              {summary && (
                <div className="p-4 border-t">
                  <Button onClick={regenerateSummary} variant="outline" className="w-full">
                    Regenerate Summary
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

