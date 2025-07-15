// frontend/src/components/Chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../assets/chat-message.css';
import '../assets/conversation-sidebar.css';
import CurvedLoop from './CurvedLoop';
import ChatMessage from './ChatMessage';
import ConversationSidebar from './ConversationSidebar';
import config from '../config';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages?: Message[];
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Load conversation if ID is set
  // Refresh conversations when a new one is created or when component mounts
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversation = async (conversationId: string) => {
    try {
      setLoading(true);
      
      // First get the conversation details
      const conversationResponse = await fetch(`${config.apiUrl}/conversations/${conversationId}`);
      
      if (!conversationResponse.ok) {
        throw new Error(`HTTP error! status: ${conversationResponse.status}`);
      }
      
      // Then get the messages for this conversation
      const messagesResponse = await fetch(`${config.apiUrl}/conversations/${conversationId}/messages`);
      
      if (!messagesResponse.ok) {
        throw new Error(`HTTP error! status: ${messagesResponse.status}`);
      }
      
      const messagesData = await messagesResponse.json();
      
      if (Array.isArray(messagesData) && messagesData.length > 0) {
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setMessages([{ role: 'assistant', content: 'Failed to load conversation.' }]);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (firstMessage?: string) => {
    try {
      // Create a new conversation
      const createResponse = await fetch(`${config.apiUrl}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: firstMessage?.substring(0, 30) || 'New Conversation' }),
      });
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`);
      }
      
      const newConversation: Conversation = await createResponse.json();
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      
      // Refresh the sidebar to show the new conversation
      setTimeout(() => {
        refreshSidebar();
      }, 500);
      
      // If we have a first message, send it
      if (firstMessage) {
        await sendMessageToConversation(newConversation.id, firstMessage);
      }
      
      return newConversation.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  };

  const sendMessageToConversation = async (conversationId: string, content: string) => {
    try {
      setLoading(true);
      
      // Add user message to UI immediately
      const newUserMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, newUserMessage]);
      
      // Send message to API
      const response = await fetch(`${config.apiUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.answer) {
        const newBotMessage: Message = { role: 'assistant', content: data.answer };
        setMessages(prev => [...prev, newBotMessage]);
      } else {
        throw new Error('No answer in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const messageContent = input.trim();
    setInput('');
    
    // If no conversation is active, create a new one
    if (!currentConversationId) {
      const newConversationId = await createNewConversation(messageContent);
      if (!newConversationId) {
        setMessages([{ role: 'assistant', content: 'Failed to create a new conversation.' }]);
      }
    } else {
      // Send message to existing conversation
      await sendMessageToConversation(currentConversationId, messageContent);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  // Refresh the sidebar when a new conversation is created
  const refreshSidebar = () => {
    // This will trigger the ConversationSidebar to refresh its list
    const sidebar = document.querySelector('.conversation-sidebar');
    if (sidebar) {
      const event = new Event('refresh');
      sidebar.dispatchEvent(event);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (  
    <div className="chat-container">
      <ConversationSidebar 
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        currentConversationId={currentConversationId}
        className={sidebarOpen ? 'open' : ''}
      />
      
      <div className="chat-wrapper">
        <div className="model-info">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <CurvedLoop 
            marqueeText="  ✦  AI Support Chat  ✦  "
            speed={0.5}
            curveAmount={-10}
            interactive={false}
            className="custom-text-style"
          />
          <p>Powered by advanced AI models to assist you.</p>
        </div>
        <div className="chat-box" ref={chatBoxRef}>
          {messages.length === 0 && !loading && (
            <div className="empty-chat">
              <h3>Start a new conversation</h3>
              <p>Type a message below to begin chatting.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} sender={m.role} text={m.content} />
          ))}
          {loading && <div className="chat-message bot"><i>Bot is typing...</i></div>}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Tapez votre message..."
            disabled={loading}
            aria-label="Chat input"
          />
          <button onClick={handleSendMessage} disabled={loading || !input.trim()} aria-label="Send message">
            Envoyer
          </button>
          <button onClick={handleNewConversation} aria-label="New conversation">
            New
          </button>
        </div>
        <footer>
          <p>
            <a href="https://github.com/sambarbarin/ai-support-chat" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
          </p>
          <p>Personal Information: [To be provided]</p>
        </footer>
      </div>
    </div>
  );
}
