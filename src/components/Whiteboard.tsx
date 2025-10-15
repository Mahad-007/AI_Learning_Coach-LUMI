import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Line, Text, Circle, Rect, Image as KonvaImage } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Eraser, 
  Download, 
  Upload,
  Users,
  MessageCircle,
  Settings,
  Wand2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WhiteboardService } from '@/services/whiteboardService';
import { AIAssistant } from './AIAssistant';
import { FriendInvitationComponent } from './FriendInvitation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import type { 
  WhiteboardElement, 
  WhiteboardParticipant, 
  WhiteboardMessage,
  DrawingData,
  TextData,
  ShapeData 
} from '@/types/whiteboard';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface WhiteboardProps {
  sessionId: string;
  sessionTitle?: string;
  sessionTopic?: string;
  onClose?: () => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId, sessionTitle, sessionTopic, onClose }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const stageRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [participants, setParticipants] = useState<WhiteboardParticipant[]>([]);
  const [messages, setMessages] = useState<WhiteboardMessage[]>([]);
  const [currentTool, setCurrentTool] = useState<'pen' | 'brush' | 'eraser' | 'text' | 'shape' | 'select'>('pen');
  const [currentColor, setCurrentColor] = useState(isDark ? '#FFFFFF' : '#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Update current color when theme changes
  useEffect(() => {
    const themeColor = isDark ? '#FFFFFF' : '#000000';
    setCurrentColor(themeColor);
  }, [isDark]);

  // Theme-aware colors
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    isDark ? '#FFFFFF' : '#000000', // Primary text color based on theme
    isDark ? '#000000' : '#FFFFFF', // Background color based on theme
    '#808080', '#FF0000', '#00FF00', '#0000FF'
  ];

  // Calculate optimal stage size based on content
  const calculateStageSize = useCallback(() => {
    if (!elements.length) {
      const baseWidth = isMobile ? window.innerWidth - 20 : 1200;
      const baseHeight = isMobile ? window.innerHeight - 200 : 800;
      return { width: baseWidth, height: baseHeight };
    }

    let maxX = 0;
    let maxY = 0;

    elements.forEach(element => {
      if (element.type === 'text') {
        const data = element.data as TextData;
        const textWidth = (data.text?.length || 0) * (data.fontSize || 16) * 0.6; // Approximate character width
        const textHeight = (data.fontSize || 16) * 1.2; // Approximate line height
        maxX = Math.max(maxX, (data.x || 0) + textWidth);
        maxY = Math.max(maxY, (data.y || 0) + textHeight);
      } else if (element.type === 'drawing') {
        const data = element.data as DrawingData;
        const points = data.points || [];
        for (let i = 0; i < points.length; i += 2) {
          maxX = Math.max(maxX, points[i] || 0);
          maxY = Math.max(maxY, points[i + 1] || 0);
        }
      }
    });

    // Add padding and ensure minimum size
    const padding = isMobile ? 50 : 100;
    const minWidth = isMobile ? window.innerWidth - 20 : Math.max(1200, window.innerWidth - 400);
    const minHeight = isMobile ? window.innerHeight - 200 : Math.max(800, window.innerHeight - 100);
    
    return {
      width: Math.max(minWidth, maxX + padding),
      height: Math.max(minHeight, maxY + padding)
    };
  }, [elements, isMobile]);

  // Update stage size when elements change
  useEffect(() => {
    const newSize = calculateStageSize();
    setStageSize(newSize);
  }, [elements, calculateStageSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = calculateStageSize();
      setStageSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateStageSize]);

  // Load initial data
  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const [elementsData, participantsData, messagesData] = await Promise.all([
        WhiteboardService.getSessionElements(sessionId),
        WhiteboardService.getSessionParticipants(sessionId),
        WhiteboardService.getSessionMessages(sessionId)
      ]);
      
      setElements(elementsData);
      setParticipants(participantsData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading session data:', error);
      toast.error('Failed to load session data');
    }
  };

  // Realtime subscriptions for elements, messages, and participants
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`whiteboard:${sessionId}`);

    // Elements INSERT
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'whiteboard_elements', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const newEl = payload.new as WhiteboardElement;
        setElements(prev => {
          if (prev.some(e => e.id === newEl.id)) return prev; // dedupe
          // Replace temp element if it exists (same last points pattern not reliable; rely on id dedupe only)
          return [...prev, newEl];
        });
      }
    );

    // Elements UPDATE
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'whiteboard_elements', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const updated = payload.new as WhiteboardElement;
        setElements(prev => prev.map(e => (e.id === updated.id ? updated : e)));
      }
    );

    // Elements DELETE
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'whiteboard_elements', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const removedId = payload.old.id as string;
        setElements(prev => prev.filter(e => e.id !== removedId));
      }
    );

    // Messages INSERT
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'whiteboard_messages', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const msg = payload.new as WhiteboardMessage;
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
      }
    );

    // Participants INSERT
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'whiteboard_participants', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const p = payload.new as WhiteboardParticipant;
        setParticipants(prev => (prev.some(x => x.id === p.id) ? prev : [...prev, p]));
      }
    );

    // Participants DELETE
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'whiteboard_participants', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const removedId = payload.old.id as string;
        setParticipants(prev => prev.filter(p => p.id !== removedId));
      }
    );

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        // Optionally log
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Drawing handlers - unified for mouse and touch
  const handlePointerDown = useCallback((e: any) => {
    if (isAnimating) return; // Prevent drawing during AI animation
    
    // Prevent default touch behavior to avoid scrolling
    e.evt.preventDefault();
    
    if (currentTool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      setTextPosition(pos);
      setShowTextInput(true);
      return;
    }

    if (currentTool === 'pen' || currentTool === 'brush' || currentTool === 'eraser') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      
      const newElement: Omit<WhiteboardElement, 'id' | 'created_at' | 'updated_at'> = {
        session_id: sessionId,
        type: 'drawing',
        data: {
          points: [pos.x, pos.y],
          strokeWidth: currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth,
          strokeColor: currentTool === 'eraser' ? (isDark ? '#000000' : '#FFFFFF') : currentColor,
          tool: currentTool
        } as DrawingData,
        created_by: user?.id || '',
        layer: elements.length + 1,
        visible: true
      };

      // Add element immediately for smooth drawing
      const tempElement = { ...newElement, id: `temp-${Date.now()}` } as WhiteboardElement;
      setElements(prev => [...prev, tempElement]);

      // Save to backend
      WhiteboardService.addElement(sessionId, newElement).then((element) => {
        setElements(prev => prev.map(el => 
          el.id === tempElement.id ? element : el
        ));
      }).catch(console.error);
    }
  }, [currentTool, strokeWidth, currentColor, sessionId, user?.id, elements.length, isAnimating]);

  const handlePointerMove = useCallback((e: any) => {
    if (!isDrawing || (currentTool !== 'pen' && currentTool !== 'brush' && currentTool !== 'eraser') || isAnimating) return;

    // Prevent default touch behavior to avoid scrolling
    e.evt.preventDefault();

    const pos = e.target.getStage().getPointerPosition();
    const lastElement = elements[elements.length - 1];
    
    if (lastElement && lastElement.type === 'drawing') {
      const updatedData = {
        ...lastElement.data,
        points: [...lastElement.data.points, pos.x, pos.y]
      };
      
      // Update UI immediately for smooth drawing
      setElements(prev => prev.map(el => 
        el.id === lastElement.id ? { ...el, data: updatedData } : el
      ));
      
      // Debounce backend updates to avoid too many API calls
      if (lastElement.id.startsWith('temp-')) {
        // For temporary elements, update immediately
        return;
      }
      
      // For existing elements, update backend
      WhiteboardService.updateElement(lastElement.id, { data: updatedData }).catch(console.error);
    }
  }, [isDrawing, currentTool, elements, isAnimating]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Text handling
  const handleAddText = useCallback(() => {
    if (!newText.trim()) return;

    const textElement: Omit<WhiteboardElement, 'id' | 'created_at' | 'updated_at'> = {
      session_id: sessionId,
      type: 'text',
      data: {
        text: newText,
        x: textPosition.x,
        y: textPosition.y,
        fontSize: 16,
        fontFamily: 'Arial',
        color: currentColor,
        rotation: 0
      } as TextData,
      created_by: user?.id || '',
      layer: elements.length + 1,
      visible: true
    };

    WhiteboardService.addElement(sessionId, textElement).then((element) => {
      setElements(prev => [...prev, element]);
      setNewText('');
      setShowTextInput(false);
    }).catch(console.error);
  }, [newText, textPosition, currentColor, sessionId, user?.id, elements.length]);

  // Animate drawing elements smoothly (append to local state after a delay)
  const animateDrawing = useCallback(async (element: WhiteboardElement, delay: number = 0) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setElements(prev => [...prev, element]);
        resolve();
      }, delay);
    });
  }, []);

  // Chat handling
  const handleAddElements = useCallback(async (newElements: WhiteboardElement[]) => {
    setIsAnimating(true);

    // Sort by layer for proper order
    const sortedElements = [...newElements].sort((a, b) => (a.layer || 0) - (b.layer || 0));

    // Persist each element to DB so it broadcasts via realtime, and animate locally
    for (let i = 0; i < sortedElements.length; i++) {
      const raw = sortedElements[i];
      const delay = raw.type === 'drawing' ? i * 200 : i * 100;

      const elementToInsert: Omit<WhiteboardElement, 'id' | 'created_at' | 'updated_at'> = {
        session_id: sessionId,
        type: raw.type,
        data: raw.data,
        created_by: user?.id || '',
        layer: raw.layer ?? i + 1,
        visible: raw.visible ?? true
      } as any;

      try {
        const inserted = await WhiteboardService.addElement(sessionId, elementToInsert);
        // Animate the inserted version (has definitive id), realtime will also deliver but dedupe by id
        await animateDrawing(inserted, delay);
      } catch (e) {
        console.error('Error adding AI element:', e);
        toast.error('Failed to add AI-generated element');
      }
    }

    setIsAnimating(false);
  }, [animateDrawing, sessionId, user?.id]);

  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim()) return;

    try {
      const message = await WhiteboardService.sendMessage(sessionId, chatMessage);
      setMessages(prev => [...prev, message]);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [chatMessage, sessionId]);

  // Export/Import
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(elements, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [elements, sessionId]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedElements = JSON.parse(e.target?.result as string);
        setElements(importedElements);
        toast.success('Whiteboard imported successfully');
      } catch (error) {
        toast.error('Failed to import whiteboard');
      }
    };
    reader.readAsText(file);
  }, []);

  // Render drawing elements
  const renderDrawingElement = (element: WhiteboardElement) => {
    const data = element.data as DrawingData;
    if (!data.points || data.points.length < 2) return null;
    
    return (
      <Line
        key={element.id}
        points={data.points}
        stroke={data.strokeColor}
        strokeWidth={data.strokeWidth || 2}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation={data.tool === 'eraser' ? 'destination-out' : 'source-over'}
        listening={!isAnimating} // Disable interaction during animation
      />
    );
  };

  // Render text elements
  const renderTextElement = (element: WhiteboardElement) => {
    const data = element.data as TextData;
    if (!data.text) return null;
    
    return (
      <Text
        key={element.id}
        x={data.x || 50}
        y={data.y || 50}
        text={data.text}
        fontSize={data.fontSize || 16}
        fontFamily={data.fontFamily || 'Arial'}
        fill={data.color || (isDark ? '#FFFFFF' : '#000000')}
        rotation={data.rotation || 0}
        width={data.width || 400} // Set default width to prevent overflow
        wrap="word"
        align="left"
        verticalAlign="top"
        padding={10}
        draggable={!isAnimating} // Disable dragging during animation
        listening={!isAnimating} // Disable interaction during animation
        onDragEnd={(e) => {
          if (!isAnimating) {
            const newData = { ...data, x: e.target.x(), y: e.target.y() };
            WhiteboardService.updateElement(element.id, { data: newData }).catch(console.error);
          }
        }}
      />
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Toolbar */}
      <div className={`${isMobile ? 'fixed top-20 left-0 z-40 w-64 h-full transform transition-transform duration-300' : 'w-16'} ${showMobileMenu || !isMobile ? 'translate-x-0' : '-translate-x-full'} bg-card border-r border-border flex flex-col items-center py-4 space-y-2 overflow-y-auto`}>
        <Button
          variant={currentTool === 'pen' ? 'default' : 'ghost'}
          size={isMobile ? "default" : "sm"}
          onClick={() => setCurrentTool('pen')}
          className={isMobile ? "w-full justify-start" : ""}
        >
          <Palette className="h-4 w-4" />
          {isMobile && <span className="ml-2">Pen</span>}
        </Button>
        <Button
          variant={currentTool === 'text' ? 'default' : 'ghost'}
          size={isMobile ? "default" : "sm"}
          onClick={() => setCurrentTool('text')}
          className={isMobile ? "w-full justify-start" : ""}
        >
          <Type className="h-4 w-4" />
          {isMobile && <span className="ml-2">Text</span>}
        </Button>
        <Button
          variant={currentTool === 'shape' ? 'default' : 'ghost'}
          size={isMobile ? "default" : "sm"}
          onClick={() => setCurrentTool('shape')}
          className={isMobile ? "w-full justify-start" : ""}
        >
          <Square className="h-4 w-4" />
          {isMobile && <span className="ml-2">Shape</span>}
        </Button>
        <Button
          variant={currentTool === 'eraser' ? 'default' : 'ghost'}
          size={isMobile ? "default" : "sm"}
          onClick={() => setCurrentTool('eraser')}
          className={isMobile ? "w-full justify-start" : ""}
        >
          <Eraser className="h-4 w-4" />
          {isMobile && <span className="ml-2">Eraser</span>}
        </Button>
        
        <Separator className="my-2" />
        
        <Button variant="ghost" size={isMobile ? "default" : "sm"} onClick={handleExport} className={isMobile ? "w-full justify-start" : ""}>
          <Download className="h-4 w-4" />
          {isMobile && <span className="ml-2">Export</span>}
        </Button>
        <Button variant="ghost" size={isMobile ? "default" : "sm"} onClick={() => document.getElementById('import-file')?.click()} className={isMobile ? "w-full justify-start" : ""}>
          <Upload className="h-4 w-4" />
          {isMobile && <span className="ml-2">Import</span>}
        </Button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        
        <Separator className="my-2" />
        
        <Button variant="ghost" size={isMobile ? "default" : "sm"} onClick={() => setShowChat(!showChat)} className={isMobile ? "w-full justify-start" : ""}>
          <MessageCircle className="h-4 w-4" />
          {isMobile && <span className="ml-2">Chat</span>}
        </Button>
        <Button variant="ghost" size={isMobile ? "default" : "sm"} onClick={() => setShowSettings(!showSettings)} className={isMobile ? "w-full justify-start" : ""}>
          <Settings className="h-4 w-4" />
          {isMobile && <span className="ml-2">Settings</span>}
        </Button>
        
        <Separator className="my-2" />
        
        <Button 
          variant="ghost" 
          size={isMobile ? "default" : "sm"} 
          onClick={() => {
            if (window.confirm('Are you sure you want to clear the whiteboard?')) {
              setElements([]);
            }
          }}
          disabled={isAnimating}
          className={isMobile ? "w-full justify-start" : ""}
        >
          <Eraser className="h-4 w-4" />
          {isMobile && <span className="ml-2">Clear</span>}
        </Button>
      </div>

      {/* Color Palette */}
      {!isMobile && (
        <div className="w-48 bg-card border-r border-border p-4 overflow-y-auto">
          <h3 className="text-sm font-medium mb-2 text-foreground">Colors</h3>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 ${
                  currentColor === color ? 'border-foreground' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium text-foreground">Stroke Width</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full mt-1"
            />
            <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
          </div>
        </div>
      )}

      {/* Mobile Color Palette */}
      {isMobile && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="grid grid-cols-8 gap-1">
              {colors.slice(0, 8).map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>
            <div className="flex flex-col items-center space-y-1">
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16"
                orient="vertical"
              />
              <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className={`flex-1 relative overflow-auto ${isMobile ? 'ml-0' : ''}`} ref={canvasContainerRef}>
        {/* Session Title Header */}
        <div className={`sticky top-0 z-20 bg-card border-b border-border px-4 py-2 shadow-sm ${isMobile ? 'pt-20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{sessionTitle || 'Whiteboard Session'}</h2>
                <p className="text-sm text-muted-foreground">{sessionTopic || 'Interactive Learning Session'}</p>
              </div>
              {isAnimating && (
                <div className="flex items-center space-x-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">AI Drawing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close Session
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div 
          className="bg-card whiteboard-canvas"
          style={{ 
            width: stageSize.width, 
            height: stageSize.height,
            minWidth: isMobile ? '100vw' : '100%',
            minHeight: isMobile ? 'calc(100vh - 120px)' : '100%'
          }}
        >
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handlePointerDown}
            onMousemove={handlePointerMove}
            onMouseup={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            ref={stageRef}
          >
            <Layer>
              {elements.map((element, index) => {
                const safeKey = element.id || `${element.type}-${element['layer'] ?? 0}-${index}`;
                switch (element.type) {
                  case 'drawing':
                    return (<React.Fragment key={safeKey}>{renderDrawingElement(element)}</React.Fragment>);
                  case 'text':
                    return (<React.Fragment key={safeKey}>{renderTextElement(element)}</React.Fragment>);
                  default:
                    return null;
                }
              })}
            </Layer>
          </Stage>
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute top-4 left-4 bg-card p-4 rounded-lg shadow-lg border border-border z-10">
            <Input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter text..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleAddText}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {!isMobile && (
        <div className="w-80 bg-card border-l border-border flex flex-col overflow-hidden">
          {/* Participants */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Participants</h3>
              <Badge variant="secondary">{participants.length}</Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="text-sm text-foreground">{participant.user_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {participant.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          {showChat && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-border flex-shrink-0">
                <h3 className="text-sm font-medium text-foreground">Chat</h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2 min-h-0">
                {messages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <span className="font-medium text-foreground">{message.user_name}:</span>
                    <span className="ml-2 text-foreground">{message.message}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="sm" onClick={handleSendMessage}>Send</Button>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {showSettings && (
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
              <h3 className="text-sm font-medium mb-4 text-foreground">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">AI Assistant</label>
                  <AIAssistant 
                    sessionId={sessionId}
                    topic={sessionTopic || 'General Topic'}
                    onAddElements={handleAddElements}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Session</label>
                  <FriendInvitationComponent 
                    sessionId={sessionId}
                    sessionTitle={sessionTitle || 'Whiteboard Session'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (showChat || showSettings) && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowChat(false); setShowSettings(false); }}>
          <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Participants */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground">Participants</h3>
                <Badge variant="secondary">{participants.length}</Badge>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: participant.color }}
                    />
                    <span className="text-sm text-foreground">{participant.user_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            {showChat && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-border flex-shrink-0">
                  <h3 className="text-sm font-medium text-foreground">Chat</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-2 min-h-0">
                  {messages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <span className="font-medium text-foreground">{message.user_name}:</span>
                      <span className="ml-2 text-foreground">{message.message}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border flex-shrink-0">
                  <div className="flex space-x-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="sm" onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {showSettings && (
              <div className="flex-1 p-4 overflow-y-auto min-h-0">
                <h3 className="text-sm font-medium mb-4 text-foreground">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">AI Assistant</label>
                    <AIAssistant 
                      sessionId={sessionId}
                      topic={sessionTopic || 'General Topic'}
                      onAddElements={handleAddElements}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Session</label>
                    <FriendInvitationComponent 
                      sessionId={sessionId}
                      sessionTitle={sessionTitle || 'Whiteboard Session'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
