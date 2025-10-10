export interface WhiteboardSession {
  id: string;
  title: string;
  topic: string;
  host_id: string;
  host_name: string;
  is_active: boolean;
  max_participants: number;
  current_participants: number;
  created_at: string;
  updated_at: string;
  settings: WhiteboardSettings;
}

export interface WhiteboardSettings {
  allow_drawing: boolean;
  allow_text: boolean;
  allow_shapes: boolean;
  allow_images: boolean;
  ai_assistant_enabled: boolean;
  recording_enabled: boolean;
}

export interface WhiteboardParticipant {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  role: 'host' | 'teacher' | 'student';
  joined_at: string;
  is_active: boolean;
  cursor_position?: { x: number; y: number };
  color: string;
}

export interface WhiteboardElement {
  id: string;
  session_id: string;
  type: 'drawing' | 'text' | 'shape' | 'image';
  data: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  layer: number;
  visible: boolean;
}

export interface DrawingData {
  points: { x: number; y: number }[];
  strokeWidth: number;
  strokeColor: string;
  tool: 'pen' | 'brush' | 'eraser';
}

export interface TextData {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
}

export interface ShapeData {
  shape: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export interface ImageData {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface WhiteboardMessage {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'ai';
}

export interface FriendInvitation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  session_id: string;
  invitation_type: 'global' | 'facebook';
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
}

export interface FacebookFriend {
  id: string;
  name: string;
  picture: {
    data: {
      url: string;
    };
  };
}

export interface WhiteboardState {
  elements: WhiteboardElement[];
  participants: WhiteboardParticipant[];
  messages: WhiteboardMessage[];
  currentTool: 'pen' | 'brush' | 'eraser' | 'text' | 'shape' | 'select';
  currentColor: string;
  strokeWidth: number;
  isDrawing: boolean;
  selectedElement: string | null;
}
