import React, { useState, useEffect } from 'react';
import config from '../config';

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

interface ConversationSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId: string | null;
  className?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
  className = ''
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    
    // Add event listener for refresh events
    const sidebarElement = document.querySelector('.conversation-sidebar');
    if (sidebarElement) {
      const handleRefresh = () => {
        fetchConversations();
      };
      
      sidebarElement.addEventListener('refresh', handleRefresh);
      
      return () => {
        sidebarElement.removeEventListener('refresh', handleRefresh);
      };
    }
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/conversations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(errorMessage);
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    
    try {
      const response = await fetch(`${config.apiUrl}/conversations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the conversation list
      fetchConversations();
      
      // If the deleted conversation was the current one, trigger a new conversation
      if (id === currentConversationId) {
        onNewConversation();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`conversation-sidebar ${className}`}>
      <div className="sidebar-header">
        <h2>Conversations</h2>
        <button 
          className="new-chat-button"
          onClick={onNewConversation}
        >
          New Chat
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading conversations...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : conversations.length === 0 ? (
        <div className="no-conversations">No conversations yet</div>
      ) : (
        <ul className="conversation-list">
          {conversations.map((conversation) => (
            <li 
              key={conversation.id}
              className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="conversation-title">{conversation.title}</div>
              <div className="conversation-date">{formatDate(conversation.updatedAt)}</div>
              <button 
                className="delete-conversation-button"
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                aria-label="Delete conversation"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationSidebar;
