import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Highlighter } from 'lucide-react';
import type { UserNote, UserHighlight } from '@/types/lesson';
import { formatDistanceToNow } from 'date-fns';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: UserNote[];
  onAddNote: (content: string, sectionAnchor?: string) => void;
  onDeleteNote: (noteId: string) => void;
  highlights: UserHighlight[];
  onDeleteHighlight: (highlightId: string) => void;
}

const highlightColors = {
  yellow: 'bg-yellow-200 dark:bg-yellow-900/30',
  green: 'bg-green-200 dark:bg-green-900/30',
  blue: 'bg-blue-200 dark:bg-blue-900/30',
  pink: 'bg-pink-200 dark:bg-pink-900/30',
  purple: 'bg-purple-200 dark:bg-purple-900/30',
};

export function NotesPanel({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onDeleteNote,
  highlights,
  onDeleteHighlight,
}: NotesPanelProps) {
  const [noteContent, setNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const handleAddNote = () => {
    if (noteContent.trim()) {
      onAddNote(noteContent.trim());
      setNoteContent('');
      setShowAddNote(false);
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-background border-l shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-lg">Notes & Highlights</h2>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              </div>

              {/* New Note Form */}
              {showAddNote && (
                <div className="p-4 border-b bg-muted/50">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note..."
                    className="mb-2"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNote} className="flex-1">
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddNote(false);
                        setNoteContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Content */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Notes */}
                  {notes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                        Notes ({notes.length})
                      </h3>
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <Card key={note.id} className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(note.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onDeleteNote(note.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
                        <Highlighter className="w-4 h-4" />
                        Highlights ({highlights.length})
                      </h3>
                      <div className="space-y-3">
                        {highlights.map((highlight) => (
                          <Card key={highlight.id} className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className={highlightColors[highlight.color]}
                              >
                                {highlight.color}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onDeleteHighlight(highlight.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <p
                              className={`text-sm p-2 rounded ${
                                highlightColors[highlight.color]
                              }`}
                            >
                              "{highlight.snippet}"
                            </p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {notes.length === 0 && highlights.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-sm">
                        No notes or highlights yet. Add your first note or select text to
                        highlight!
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

