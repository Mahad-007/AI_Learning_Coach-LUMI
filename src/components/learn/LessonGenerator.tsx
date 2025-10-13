import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LessonService } from '@/services/lessonService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Difficulty } from '@/types/lesson';

interface LessonGeneratorProps {
  onLessonGenerated: () => void;
}

export function LessonGenerator({ onLessonGenerated }: LessonGeneratorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [duration, setDuration] = useState(30);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter what you want to learn');
      return;
    }

    try {
      setLoading(true);

      // Extract subject and topic from prompt using a simple approach
      // You could enhance this with AI parsing if needed
      const inferredSubject = subject || extractSubject(prompt);
      
      await LessonService.generateLesson(user!.id, {
        topic: prompt.trim(),
        subject: inferredSubject,
        difficulty,
        duration,
      });

      toast.success('Lesson generated successfully!');
      setPrompt('');
      setSubject('');
      onLessonGenerated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate lesson');
    } finally {
      setLoading(false);
    }
  };

  const extractSubject = (text: string): string => {
    // Simple keyword extraction for common subjects
    const lowerText = text.toLowerCase();
    if (lowerText.includes('javascript') || lowerText.includes('js')) return 'JavaScript';
    if (lowerText.includes('python')) return 'Python';
    if (lowerText.includes('react')) return 'React';
    if (lowerText.includes('css') || lowerText.includes('styling')) return 'CSS';
    if (lowerText.includes('html')) return 'HTML';
    if (lowerText.includes('typescript')) return 'TypeScript';
    if (lowerText.includes('node')) return 'Node.js';
    if (lowerText.includes('database') || lowerText.includes('sql')) return 'Database';
    if (lowerText.includes('math')) return 'Mathematics';
    if (lowerText.includes('physics')) return 'Physics';
    if (lowerText.includes('chemistry')) return 'Chemistry';
    return 'General';
  };

  const quickTopics = [
    { label: 'JavaScript Array Methods', subject: 'JavaScript', difficulty: 'intermediate' as Difficulty },
    { label: 'React Hooks Basics', subject: 'React', difficulty: 'beginner' as Difficulty },
    { label: 'Python Data Structures', subject: 'Python', difficulty: 'intermediate' as Difficulty },
    { label: 'CSS Flexbox Layout', subject: 'CSS', difficulty: 'beginner' as Difficulty },
    { label: 'SQL Joins Explained', subject: 'Database', difficulty: 'intermediate' as Difficulty },
    { label: 'TypeScript Generics', subject: 'TypeScript', difficulty: 'advanced' as Difficulty },
  ];

  const handleQuickTopic = (topic: string, subj: string, diff: Difficulty) => {
    setPrompt(topic);
    setSubject(subj);
    setDifficulty(diff);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Generate Custom Lesson</h2>
            <p className="text-muted-foreground">
              Describe what you want to learn, and AI will create a personalized lesson just for you!
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="space-y-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base">
              What do you want to learn?
            </Label>
            <Textarea
              id="prompt"
              placeholder="e.g., I want to learn about React hooks and how to use useState and useEffect..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Quick Topics */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Quick Topics:</Label>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTopic(topic.label, topic.subject, topic.difficulty)}
                  className="text-xs"
                >
                  {topic.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="e.g., JavaScript"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as Difficulty)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            size="lg"
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Your Lesson...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Lesson
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            AI will analyze your request and create a comprehensive lesson with clear explanations,
            code examples, practice exercises, and interactive quizzes.
          </p>
        </div>
      </div>
    </Card>
  );
}

