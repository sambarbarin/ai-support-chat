// frontend/src/components/Chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../assets/chat-message.css';

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
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.answer) {
        const newBotMessage: Message = { role: 'assistant', content: data.answer };
        setMessages(prev => [...prev, newBotMessage]);
      } else {
        throw new Error('No answer in response');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de réponse.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role === 'user' ? 'user' : 'bot'}`}>
            <b>{m.role === 'user' ? 'Moi' : 'Bot'}:</b> {m.content}
          </div>
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
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
