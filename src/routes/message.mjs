import express from 'express';
import Message from '../schemas/message.mjs'; 

const router = express.Router();

router.get('/messages/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversation: conversationId });

    res.status(200).json(messages || []);

  } catch (error) {
    console.error('Error retrieving messages from the conversation:', error);
    res.status(500).json({ message: 'Error retrieving messages from the conversation' });
  }
});

export default router;
