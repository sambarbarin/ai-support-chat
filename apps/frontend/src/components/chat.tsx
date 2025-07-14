// frontend/src/components/Chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../assets/chat-message.css';
import CurvedLoop from './CurvedLoop';
import ChatMessage from './ChatMessage';
import config from '../config';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;

    const newUserMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
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
  }

  function clearChat() {
    setMessages([]);
  }

  return (  
    <div className="chat-wrapper">
      <div className="model-info">
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
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Tapez votre message..."
          disabled={loading}
          aria-label="Chat input"
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} aria-label="Send message">
          Envoyer
        </button>
        <button onClick={clearChat} disabled={loading || messages.length === 0} aria-label="Clear chat">
          Clear
        </button>
      </div>
      <footer>
        <p>
          <a href="https://github.com/sambarbarin/ai-support-chat" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
        </p>
        <p>Personal Information: [To be provided]</p>
      </footer>
    </div>
  );
}
