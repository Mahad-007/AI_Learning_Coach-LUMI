import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedLessonService } from '@/services/enhancedLessonService';
import { LessonList } from '@/components/learn/LessonList';
import { LessonViewer } from '@/components/learn/LessonViewer';
import { ContinueLearning } from '@/components/learn/ContinueLearning';
import { LessonGenerator } from '@/components/learn/LessonGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LessonWithProgress } from '@/types/lesson';
import { Loader2, Library, Sparkles } from 'lucide-react';

export default function Learn() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [inProgressLessons, setInProgressLessons] = useState<LessonWithProgress[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generate');
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    subject: '',
  });

  // Load lessons on mount
  useEffect(() => {
    if (user) {
      loadLessons();
      loadInProgressLessons();
    }
  }, [user]);

  // Handle deep linking
  useEffect(() => {
    const lessonId = searchParams.get('lessonId');
    if (lessonId && user && lessons.length > 0) {
      const lesson = lessons.find((l) => l.id === lessonId);
      if (lesson) {
        setSelectedLesson(lesson);
      }
    }
  }, [searchParams, lessons, user]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await EnhancedLessonService.getAllLessons(user!.id, filters);
      setLessons(data);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInProgressLessons = async () => {
    try {
      const data = await EnhancedLessonService.getInProgressLessons(user!.id);
      setInProgressLessons(data);
    } catch (error) {
      console.error('Failed to load in-progress lessons:', error);
    }
  };

  const handleSelectLesson = (lesson: LessonWithProgress) => {
    setSelectedLesson(lesson);
    setSearchParams({ lessonId: lesson.id });
  };

  const handleCloseLesson = () => {
    setSelectedLesson(null);
    setSearchParams({});
    // Reload to refresh progress
    loadLessons();
    loadInProgressLessons();
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    if (user) {
      loadLessons();
    }
  }, [filters]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access lessons.</p>
      </div>
    );
  }

  // Show lesson viewer if a lesson is selected
  if (selectedLesson) {
    return <LessonViewer lesson={selectedLesson} onClose={handleCloseLesson} />;
  }

  // Show lesson list
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learn</h1>
          <p className="text-muted-foreground">
            Generate custom lessons with AI or explore your saved lessons
          </p>
        </div>

        {/* Continue Learning Section */}
        {inProgressLessons.length > 0 && (
          <div className="mb-8">
            <ContinueLearning
              lessons={inProgressLessons}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        )}

        {/* Main Content - Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Lesson
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Library className="w-4 h-4" />
              My Lessons {lessons.length > 0 && `(${lessons.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <LessonGenerator
              onLessonGenerated={() => {
                loadLessons();
                loadInProgressLessons();
                setActiveTab('library');
              }}
            />
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <LessonList
                lessons={lessons}
                onSelectLesson={handleSelectLesson}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

