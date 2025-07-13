import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../assets/chat-message.css';

interface ChatMessageProps {
  sender: 'user' | 'bot';
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text }) => {
  const isUser = sender === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'bot'}`}>
      {isUser ? (
        <p>{text}</p>
      ) : (
        <div className="markdown">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
