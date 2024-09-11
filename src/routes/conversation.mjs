import { Router } from 'express';
import Conversation from '../schemas/conversation.mjs';
import Message from '../schemas/message.mjs'; 
const router = Router();

router.get('/conversation/:userId1/:userId2', async (req, res) => {
  const userId1 = req.params.userId1;
  const userId2 = req.params.userId2;

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] }
    }).populate('participants', '_id displayName');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/conversation/:conversationId/message', async (req, res) => {
  const { conversationId } = req.params;
  const { content, senderId } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = new Message({
      sender: senderId,
      conversation: conversationId,
      messageType: 'text',
      content: content,
    });

    await message.save();

    conversation.messages.push(message._id);
    await conversation.save();

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
