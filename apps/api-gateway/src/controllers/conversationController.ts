import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

// Get all conversations
export const getAllConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.findAll({
      order: [['updatedAt', 'DESC']],
    });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get a single conversation with its messages
export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: Message,
          as: 'messages',
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Create a new conversation
export const createConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const conversation = await Conversation.create({ title });
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Delete a conversation
export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    await conversation.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
