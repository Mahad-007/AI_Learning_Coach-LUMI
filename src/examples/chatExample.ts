/**
 * Chat Service Examples
 * 
 * This file demonstrates how to use the ChatService with Gemini AI
 */

import { ChatService } from '../services/chatService';

// ============================================================================
// EXAMPLE 1: Send a Simple Chat Message
// ============================================================================
export async function simpleChatExample(userId: string) {
  try {
    const response = await ChatService.sendMessage(userId, {
      message: 'What is photosynthesis?',
      topic: 'Biology',
    });

    console.log('AI Response:', response.reply);
    console.log('XP Gained:', response.xp_gained);

    return response;
  } catch (error) {
    console.error('Chat failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Chat with Different Persona
// ============================================================================
export async function chatWithPersonaExample(userId: string) {
  try {
    // Use a fun, entertaining persona
    const response = await ChatService.sendMessage(userId, {
      message: 'Explain quantum mechanics',
      topic: 'Physics',
      persona: 'fun', // fun, friendly, strict, or scholar
    });

    console.log('Fun AI Response:', response.reply);

    return response;
  } catch (error) {
    console.error('Chat with persona failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Chat with Context (Follow-up Questions)
// ============================================================================
export async function chatWithContextExample(userId: string) {
  try {
    const response = await ChatService.sendMessage(userId, {
      message: 'Can you give me an example?',
      topic: 'Biology',
      context: [
        'Previous: What is photosynthesis?',
        'AI: Photosynthesis is the process by which plants...',
      ],
    });

    console.log('Contextual Response:', response.reply);

    return response;
  } catch (error) {
    console.error('Contextual chat failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Streaming Chat Response
// ============================================================================
export async function streamingChatExample(userId: string) {
  try {
    const response = await ChatService.sendMessageStream(userId, {
      message: 'Explain artificial intelligence in detail',
      topic: 'Computer Science',
      onChunk: (chunk) => {
        // This callback is called for each chunk of text as it's generated
        console.log('Chunk:', chunk);
        // Update UI in real-time
      },
    });

    console.log('Full Response:', response.reply);

    return response;
  } catch (error) {
    console.error('Streaming chat failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Get Chat History
// ============================================================================
export async function getChatHistoryExample(userId: string) {
  try {
    // Get last 20 messages
    const history = await ChatService.getChatHistory(userId, 20);

    console.log('Chat History:');
    history.forEach((msg) => {
      console.log(`[${msg.timestamp}] User: ${msg.message}`);
      console.log(`AI (${msg.persona}): ${msg.response}`);
    });

    return history;
  } catch (error) {
    console.error('Get chat history failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Get Chat History by Topic
// ============================================================================
export async function getChatHistoryByTopicExample(userId: string) {
  try {
    const history = await ChatService.getChatHistory(userId, 50, 'Biology');

    console.log('Biology Chat History:', history);

    return history;
  } catch (error) {
    console.error('Get topic chat history failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: Get All Chat Topics
// ============================================================================
export async function getChatTopicsExample(userId: string) {
  try {
    const topics = await ChatService.getChatTopics(userId);

    console.log('Available Topics:', topics);
    // Example output: ['Biology', 'Physics', 'Mathematics', ...]

    return topics;
  } catch (error) {
    console.error('Get chat topics failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 8: Clear Chat History
// ============================================================================
export async function clearChatHistoryExample(userId: string) {
  try {
    // Clear all chat history
    await ChatService.clearHistory(userId);
    console.log('Chat history cleared');

    // Or clear specific topic
    await ChatService.clearHistory(userId, 'Biology');
    console.log('Biology chat history cleared');
  } catch (error) {
    console.error('Clear chat history failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 9: React Component with Streaming
// ============================================================================

/*
import React, { useState } from 'react';
import { ChatService } from '@/services/chatService';

function ChatComponent({ userId }: { userId: string }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    setLoading(true);
    setResponse('');

    try {
      await ChatService.sendMessageStream(userId, {
        message,
        topic: 'General',
        onChunk: (chunk) => {
          setResponse((prev) => prev + chunk);
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
      />
      <button onClick={handleSendMessage} disabled={loading}>
        {loading ? 'Thinking...' : 'Send'}
      </button>
      {response && (
        <div className="ai-response">
          <h3>AI Tutor:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
*/

