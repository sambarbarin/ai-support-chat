// frontend/src/components/Chat.tsx
import React, { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div style={{ maxWidth: 600, margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          minHeight: 300,
          border: '1px solid #ccc',
          padding: 10,
          marginBottom: 10,
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, color: m.role === 'user' ? '#007bff' : '#333' }}>
            <b>{m.role === 'user' ? 'Moi' : 'Bot'}:</b> {m.content}
          </div>
        ))}
        {loading && <div><i>Bot is typing...</i></div>}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') sendMessage();
        }}
        placeholder="Tapez votre message..."
        style={{ width: '100%', padding: 8, fontSize: 16 }}
        disabled={loading}
      />
      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        style={{ marginTop: 8, padding: '8px 16px' }}
      >
        Envoyer
      </button>
    </div>
  );
}
