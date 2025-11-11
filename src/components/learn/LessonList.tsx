import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Clock, TrendingUp, BookOpen } from 'lucide-react';
import type { LessonWithProgress } from '@/types/lesson';
import { cn } from '@/lib/utils';

interface LessonListProps {
  lessons: LessonWithProgress[];
  onSelectLesson: (lesson: LessonWithProgress) => void;
  filters: {
    search: string;
    difficulty: string;
    subject: string;
  };
  onFilterChange: (filters: any) => void;
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function LessonList({
  lessons,
  onSelectLesson,
  filters,
  onFilterChange,
}: LessonListProps) {
  const subjects = Array.from(new Set(lessons.map((l) => l.subject)));

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.difficulty}
            onValueChange={(value) =>
              onFilterChange({ ...filters, difficulty: value === 'all' ? '' : value })
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {subjects.length > 1 && (
            <Select
              value={filters.subject}
              onValueChange={(value) =>
                onFilterChange({ ...filters, subject: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {(filters.search || filters.difficulty || filters.subject) && (
            <Button
              variant="outline"
              onClick={() => onFilterChange({ search: '', difficulty: '', subject: '' })}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Lessons Grid */}
      {lessons.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
              onClick={() => onSelectLesson(lesson)}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {lesson.topic}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize shrink-0',
                        difficultyColors[lesson.difficulty]
                      )}
                    >
                      {lesson.difficulty}
                    </Badge>
                  </div>
                  {lesson.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lesson.subtitle}
                    </p>
                  )}
                </div>

                {/* Subject Badge */}
                <div>
                  <Badge variant="secondary">{lesson.subject}</Badge>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.estimated_minutes || lesson.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{lesson.xp_reward} XP</span>
                  </div>
                </div>

                {/* Progress */}
                {lesson.progress && lesson.progress.percent_complete > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {lesson.progress.percent_complete}%
                      </span>
                    </div>
                    <Progress value={lesson.progress.percent_complete} className="h-2" />
                  </div>
                )}

                {/* Completion Badge */}
                {lesson.progress?.is_completed && (
                  <Badge className="w-full justify-center bg-green-500 hover:bg-green-600">
                    ✓ Completed
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

