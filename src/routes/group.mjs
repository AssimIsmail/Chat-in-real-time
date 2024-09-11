import { Router } from 'express';
import Group from '../schemas/group.mjs';
import Convergroup from '../schemas/convergroup.mjs'; // Importer le modèle des messages de groupe

const router = Router();

// Route pour créer un groupe
router.post('/groups', async (req, res) => {
  try {
    const { name, participants, userId } = req.body;

    const group = new Group({
      name,
      participants,
      admins: [userId],
    });

    await group.save();

    res.status(201).json(group);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: err.message });
  }
});

// Route pour récupérer les détails d'un groupe spécifique par ID
router.get('/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour ajouter un participant à un groupe
router.patch('/groups/:id/add-participant', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { participantId } = req.body;
    group.participants.push(participantId);
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour supprimer un participant d'un groupe
router.patch('/groups/:id/remove-participant', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { participantId } = req.body;
    group.participants = group.participants.filter(id => id.toString() !== participantId);
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour changer le nom d'un groupe
router.patch('/groups/:id/change-name', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { newName } = req.body;
    group.name = newName;
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Nouvelle route pour récupérer les groupes par participant
router.get('/groups/participant/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const groups = await Group.find({
      $or: [
        { admins: userId },
        { participants: userId }
      ]
    });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour ajouter un message à un groupe
router.post('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { sender, messageType, content } = req.body;

    const message = new Convergroup({
      sender,
      group: groupId,
      messageType,
      content,
    });

    await message.save();

    res.status(201).json(message);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ group: groupId }).populate('sender', 'name');

    if (!messages || messages.length === 0) {
      return res.json([]);
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
