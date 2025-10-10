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
  Wand2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WhiteboardService } from '@/services/whiteboardService';
import { AIAssistant } from './AIAssistant';
import { FriendInvitationComponent } from './FriendInvitation';
import type { 
  WhiteboardElement, 
  WhiteboardParticipant, 
  WhiteboardMessage,
  DrawingData,
  TextData,
  ShapeData 
} from '@/types/whiteboard';
import { toast } from 'sonner';

interface WhiteboardProps {
  sessionId: string;
  sessionTitle?: string;
  sessionTopic?: string;
  onClose?: () => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId, sessionTitle, sessionTopic, onClose }) => {
  const { user } = useAuth();
  const stageRef = useRef<any>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [participants, setParticipants] = useState<WhiteboardParticipant[]>([]);
  const [messages, setMessages] = useState<WhiteboardMessage[]>([]);
  const [currentTool, setCurrentTool] = useState<'pen' | 'brush' | 'eraser' | 'text' | 'shape' | 'select'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00', '#0000FF'
  ];

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

  // Drawing handlers
  const handleMouseDown = useCallback((e: any) => {
    if (currentTool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      setTextPosition(pos);
      setShowTextInput(true);
      return;
    }

    if (currentTool === 'pen' || currentTool === 'brush') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      
      const newElement: Omit<WhiteboardElement, 'id' | 'created_at' | 'updated_at'> = {
        session_id: sessionId,
        type: 'drawing',
        data: {
          points: [pos.x, pos.y],
          strokeWidth,
          strokeColor: currentColor,
          tool: currentTool
        } as DrawingData,
        created_by: user?.id || '',
        layer: elements.length + 1,
        visible: true
      };

      WhiteboardService.addElement(sessionId, newElement).then((element) => {
        setElements(prev => [...prev, element]);
      }).catch(console.error);
    }
  }, [currentTool, strokeWidth, currentColor, sessionId, user?.id, elements.length]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || (currentTool !== 'pen' && currentTool !== 'brush')) return;

    const pos = e.target.getStage().getPointerPosition();
    const lastElement = elements[elements.length - 1];
    
    if (lastElement && lastElement.type === 'drawing') {
      const updatedData = {
        ...lastElement.data,
        points: [...lastElement.data.points, pos.x, pos.y]
      };
      
      WhiteboardService.updateElement(lastElement.id, { data: updatedData }).then(() => {
        setElements(prev => prev.map(el => 
          el.id === lastElement.id ? { ...el, data: updatedData } : el
        ));
      }).catch(console.error);
    }
  }, [isDrawing, currentTool, elements]);

  const handleMouseUp = useCallback(() => {
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

  // Chat handling
  const handleAddElements = useCallback((newElements: WhiteboardElement[]) => {
    setElements(prev => [...prev, ...newElements]);
  }, []);

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
    return (
      <Line
        key={element.id}
        points={data.points}
        stroke={data.strokeColor}
        strokeWidth={data.strokeWidth}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation={data.tool === 'eraser' ? 'destination-out' : 'source-over'}
      />
    );
  };

  // Render text elements
  const renderTextElement = (element: WhiteboardElement) => {
    const data = element.data as TextData;
    return (
      <Text
        key={element.id}
        x={data.x}
        y={data.y}
        text={data.text}
        fontSize={data.fontSize}
        fontFamily={data.fontFamily}
        fill={data.color}
        rotation={data.rotation}
        draggable
        onDragEnd={(e) => {
          const newData = { ...data, x: e.target.x(), y: e.target.y() };
          WhiteboardService.updateElement(element.id, { data: newData });
        }}
      />
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        <Button
          variant={currentTool === 'pen' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentTool('pen')}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentTool('text')}
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === 'shape' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentTool('shape')}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === 'eraser' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentTool('eraser')}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        
        <Separator className="my-2" />
        
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
          <Upload className="h-4 w-4" />
        </Button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        
        <Separator className="my-2" />
        
        <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Color Palette */}
      <div className="w-48 bg-white border-r border-gray-200 p-4">
        <h3 className="text-sm font-medium mb-2">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 ${
                currentColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
        </div>
        
        <div className="mt-4">
          <label className="text-sm font-medium">Stroke Width</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full mt-1"
          />
          <span className="text-xs text-gray-500">{strokeWidth}px</span>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <Stage
          width={window.innerWidth - 400}
          height={window.innerHeight - 100}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {elements.map((element) => {
              switch (element.type) {
                case 'drawing':
                  return renderDrawingElement(element);
                case 'text':
                  return renderTextElement(element);
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border">
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
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Participants */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Participants</h3>
            <Badge variant="secondary">{participants.length}</Badge>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
                <span className="text-sm">{participant.user_name}</span>
                <Badge variant="outline" className="text-xs">
                  {participant.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        {showChat && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium">Chat</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="font-medium">{message.user_name}:</span>
                  <span className="ml-2">{message.message}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
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
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">AI Assistant</label>
                <AIAssistant 
                  sessionId={sessionId}
                  topic={sessionTopic || 'General Topic'}
                  onAddElements={handleAddElements}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Session</label>
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
  );
};
