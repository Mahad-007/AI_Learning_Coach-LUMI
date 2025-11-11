import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock } from 'lucide-react';
import type { LessonWithProgress } from '@/types/lesson';

interface ContinueLearningProps {
  lessons: LessonWithProgress[];
  onSelectLesson: (lesson: LessonWithProgress) => void;
}

export function ContinueLearning({ lessons, onSelectLesson }: ContinueLearningProps) {
  if (lessons.length === 0) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Continue Where You Left Off</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {lessons.slice(0, 4).map((lesson) => (
          <Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">{lesson.topic}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {lesson.subject}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {lesson.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {lesson.progress?.percent_complete || 0}%
                    </span>
                  </div>
                  <Progress
                    value={lesson.progress?.percent_complete || 0}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(lesson.progress?.time_spent || 0)} spent</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectLesson(lesson)}
                    className="gap-1"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

