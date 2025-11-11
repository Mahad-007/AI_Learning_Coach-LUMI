import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  Wand2, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Image, 
  Type, 
  Square,
  Circle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { WhiteboardService } from '@/services/whiteboardService';
import { ChatService } from '@/services/chatService';
import { generateStructuredContent } from '@/lib/geminiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import type { WhiteboardElement } from '@/types/whiteboard';
import { toast } from 'sonner';

interface AIAssistantProps {
  sessionId: string;
  topic: string;
  onAddElements: (elements: WhiteboardElement[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ sessionId, topic, onAddElements }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRequest, setUserRequest] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useAuth();
  const { isDark } = useTheme();

  const teachingSuggestions = [
    `Create a mind map for ${topic}`,
    `Draw a flowchart explaining ${topic}`,
    `Add key definitions for ${topic}`,
    `Create a timeline for ${topic}`,
    `Draw diagrams to illustrate ${topic}`,
    `Add examples and counter-examples for ${topic}`,
    `Create a comparison chart for ${topic}`,
    `Draw step-by-step process for ${topic}`
  ];

  const handleGenerateContent = async (request: string) => {
    if (!request.trim()) return;

    setLoading(true);
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const json = await generateStructuredContent<{ elements: any[] }>(
        `Generate an interactive flowchart diagram for teaching "${topic}" based on the following request: "${request}".
        
        Return ONLY valid JSON in this exact format:
        {
          "elements": [
            {
              "type": "drawing",
              "data": {
                "points": [x1, y1, x2, y2, x3, y3, ...],
                "strokeWidth": 3,
                "strokeColor": isDark ? "#64B5F6" : "#1976D2",
                "tool": "pen"
              }
            },
            {
              "type": "text",
              "data": {
                "text": "Label text",
                "x": 100,
                "y": 100,
                "width": 150,
                "fontSize": 14,
                "color": isDark ? "#FFFFFF" : "#000000"
              }
            }
          ]
        }
        
        Rules for flowchart generation:
        - Create flowchart shapes using drawing elements (rectangles, diamonds, circles)
        - Use drawing type with points array to create shapes
        - Add text labels for each shape using text elements
        - Use different colors for different types of shapes (rectangles: ${isDark ? '#64B5F6' : '#1976D2'}, diamonds: ${isDark ? '#FFB74D' : '#F57C00'}, circles: ${isDark ? '#81C784' : '#2E7D32'})
        - Space shapes with at least 200px between them
        - Start at position (100, 100) and expand horizontally/vertically
        - Use strokeWidth 3-4 for clear visibility
        - Include arrows connecting shapes using drawing elements
        - Keep text labels concise (max 20 characters)
        - Return ONLY the JSON object, nothing else`,
        'scholar'
      );

      const elements = await parseAIResponse(JSON.stringify(json), sessionId);
      onAddElements(elements);
      
      toast.success('AI content generated successfully!');

      // Skip logging to avoid schema cache issues
      // ChatService.sendMessage(user.id, {
      //   message: `AI content generated for topic "${topic}" with request: "${request}"`,
      //   persona: 'scholar',
      //   topic,
      // }).catch(() => {});
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const parseAIResponse = async (response: string, sessionId: string): Promise<WhiteboardElement[]> => {
    try {
      const cleaned = response
        .replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
        .replace(/```[\s\S]*?```/g, '$1')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/,\s*(\]|\})/g, '$1')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.elements)) return parsed.elements as any[];
    } catch (error) {
      console.warn('Error parsing AI response:', error);
    }

    // Fallback: create basic text elements from the response
    const lines = response.split('\n').filter(line => line.trim());
    const elements: WhiteboardElement[] = [];

    lines.forEach((line, index) => {
      if (line.trim()) {
        elements.push({
          id: `ai-text-${Date.now()}-${index}`,
          session_id: sessionId,
          type: 'text',
          data: {
            text: line.trim(),
            x: 50,
            y: 100 + (index * 60), // Increased spacing from 30 to 60
            width: 400, // Added width to prevent overflow
            fontSize: 16,
            fontFamily: 'Arial',
            color: isDark ? '#E0E0E0' : '#333333',
            rotation: 0
          },
          created_by: 'ai-assistant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          layer: index + 1,
          visible: true
        });
      }
    });

    return elements;
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setUserRequest(suggestion);
    handleGenerateContent(suggestion);
  };

  const handleCustomRequest = () => {
    handleGenerateContent(userRequest);
    setUserRequest('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Wand2 className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" aria-describedby="ai-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            AI Teaching Assistant
          </DialogTitle>
        </DialogHeader>
        {/* Accessibility description for dialog */}
        <DialogDescription id="ai-dialog-description" className="sr-only">
          Generate AI-powered whiteboard content, suggestions, and diagrams for the selected topic.
        </DialogDescription>
        
        <div className="space-y-6">
          {/* Topic Display */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Teaching Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {topic}
              </Badge>
            </CardContent>
          </Card>

          {/* Quick Suggestions */}
          <div>
            <h3 className="text-sm font-medium mb-3">Quick Suggestions</h3>
            <div className="grid grid-cols-2 gap-2">
              {teachingSuggestions.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-3"
                  onClick={() => handleQuickSuggestion(suggestion)}
                  disabled={loading}
                >
                  <div className="flex items-center">
                    {index % 4 === 0 && <BookOpen className="h-3 w-3 mr-2" />}
                    {index % 4 === 1 && <Target className="h-3 w-3 mr-2" />}
                    {index % 4 === 2 && <Image className="h-3 w-3 mr-2" />}
                    {index % 4 === 3 && <Lightbulb className="h-3 w-3 mr-2" />}
                    <span className="text-xs">{suggestion}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Request */}
          <div>
            <h3 className="text-sm font-medium mb-3">Custom Request</h3>
            <div className="space-y-3">
              <Textarea
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Describe what you'd like the AI to create on the whiteboard..."
                rows={3}
                disabled={loading}
              />
              <Button 
                onClick={handleCustomRequest}
                disabled={loading || !userRequest.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Types */}
          <div>
            <h3 className="text-sm font-medium mb-3">Content Types</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center p-2 border rounded-lg">
                <Type className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Text & Notes</span>
              </div>
              <div className="flex items-center p-2 border rounded-lg">
                <Square className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Shapes & Diagrams</span>
              </div>
              <div className="flex items-center p-2 border rounded-lg">
                <Circle className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-sm">Flowcharts</span>
              </div>
              <div className="flex items-center p-2 border rounded-lg">
                <ArrowRight className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-sm">Process Maps</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start">
                <Lightbulb className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">AI Tips</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Be specific about what you want to teach</li>
                    <li>• Ask for step-by-step explanations</li>
                    <li>• Request visual diagrams and examples</li>
                    <li>• Ask for interactive elements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
