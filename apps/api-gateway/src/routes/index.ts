import express from 'express';
import * as conversationController from '../controllers/conversationController';
import * as messageController from '../controllers/messageController';

const router = express.Router();

// Health check
router.get('/health', (_, res) => res.send('API Gateway is up'));

// Conversation routes
router.get('/conversations', conversationController.getAllConversations);
router.get('/conversations/:id', conversationController.getConversation);
router.post('/conversations', conversationController.createConversation);
router.delete('/conversations/:id', conversationController.deleteConversation);

// Message routes
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);

// Legacy chat route (for backward compatibility)
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    // Create a temporary conversation if none exists
    const title = 'Temporary Chat';
    const conversation = await import('../models/Conversation').then(module => {
      return module.default.create({ title });
    });

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    // Forward to the message controller
    // Add params property if it doesn't exist
    if (!req.params) {
      (req as any).params = {};
    }
    
    (req.params as any).conversationId = conversation.id;
    req.body.content = lastUserMessage.content;
    
    return messageController.sendMessage(req, res);
  } catch (err) {
    console.error('Error in legacy chat route:', err);
    return res.status(500).json({ error: 'Chat processing failed' });
  }
});

export default router;
