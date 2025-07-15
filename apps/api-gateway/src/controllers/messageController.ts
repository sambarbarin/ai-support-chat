import { Request, Response } from 'express';
import axios from 'axios';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

// Clean LLM response
function cleanResponse(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    
    // Check if conversation exists
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message and get a response
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }
    
    // Check if conversation exists
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    
    // Save user message
    const userMessage = await Message.create({
      conversationId,
      role: 'user',
      content,
    });
    
    // Get all messages in this conversation for context
    const conversationMessages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });
    
    // Format messages for LLM service
    const formattedMessages = conversationMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Send to LLM service
    const llmResponse = await axios.post('http://llm-service:8000/generate', {
      messages: formattedMessages,
    });
    
    if (llmResponse.data && llmResponse.data.reply) {
      const cleaned = cleanResponse(llmResponse.data.reply);
      
      // Save assistant message
      const assistantMessage = await Message.create({
        conversationId,
        role: 'assistant',
        content: cleaned,
      });
      
      // Update conversation's updatedAt timestamp
      await conversation.update({ updatedAt: new Date() });
      
      res.json({ answer: cleaned });
    } else {
      res.status(500).json({ error: 'Invalid response from LLM service' });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
