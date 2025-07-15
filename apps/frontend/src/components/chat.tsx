// frontend/src/components/Chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../assets/chat-message.css';
import '../assets/conversation-sidebar.css';
import CurvedLoop from './CurvedLoop';
import ChatMessage from './ChatMessage';
import ConversationSidebar from './ConversationSidebar';
import Particles from './Particles';
import Silk from './Silk';
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
  const [isUserChatting, setIsUserChatting] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
    // Set isUserChatting to true if there are messages
    setIsUserChatting(messages.length > 0);
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

  const toggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle sidebar clicked, current state:", sidebarOpen);
    setSidebarOpen(prevState => !prevState);
  };

  return (  
    <div className={`chat-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="background-silk">
        <Silk 
          speed={3}
          scale={1.5}
          color="#1a1a2e"
          noiseIntensity={1.2}
          rotation={0.2}
        />
      </div>
      <ConversationSidebar 
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        currentConversationId={currentConversationId}
        className={sidebarOpen ? 'open' : ''}
      />
      
      <div className="chat-wrapper">
        <div className="model-info">
          <button 
            className={`sidebar-toggle ${sidebarOpen ? 'active' : ''}`} 
            onClick={(e) => toggleSidebar(e)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <span className="burger-icon">☰</span>
            <span className="burger-text">{sidebarOpen ? "Close" : "Menu"}</span>
          </button>
          <CurvedLoop 
            marqueeText="  ✦  AI Support Chat  ✦  "
            speed={0.5}
            curveAmount={-10}
            interactive={false}
            className="custom-text-style"
          />
          {/* <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>Powered by advanced AI models</p> */}
        </div>
        <div className="chat-box-container">
          <div className="chat-box-particles">
            <Particles
              particleColors={['#ffffff', '#32547f', '#2ecc71']}
              particleCount={200}
              particleSpread={10}
              speed={0.2}
              particleBaseSize={100}
              moveParticlesOnHover={true}
              alphaParticles={true}
              disableRotation={false}
            />
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
            {loading && <div className="chat-message assistant"><i>Bot is typing...</i></div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              aria-label="Message input"
            />
            <button onClick={handleSendMessage} aria-label="Send message">
              Envoyer
            </button>
            <button onClick={handleNewConversation} aria-label="New conversation">
              New
            </button>
          </div>
        </div>
        <footer className={isUserChatting ? 'minimized' : ''}>
          <div className="footer-links">
            <a href="https://github.com/sambarbarin/ai-support-chat" target="_blank" rel="noopener noreferrer">
              <svg className="footer-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="footer-link-text">GitHub</span>
            </a>
            <a href="https://ollama.com/library/mistral" target="_blank" rel="noopener noreferrer">
              <svg className="footer-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="footer-link-text">Mistral Model</span>
            </a>
            <a href="https://mistral.ai/" target="_blank" rel="noopener noreferrer">
              <svg className="footer-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9zm-9-7.5A7.5 7.5 0 004.5 12c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5c0-4.142-3.358-7.5-7.5-7.5zm-1.5 12h3v-6h-3v6zm0-7.5h3v-1.5h-3v1.5z"/>
              </svg>
              <span className="footer-link-text">Mistral AI</span>
            </a>
          </div>
          <div className="contact-links">
            <a href="https://github.com/sambarbarin" target="_blank" rel="noopener noreferrer" title="GitHub">
              <svg className="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/in/sambarbarin" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <svg className="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="mailto:contact@example.com" title="Email">
              <svg className="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
