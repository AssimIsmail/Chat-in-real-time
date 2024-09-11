import { Router } from 'express';
import User from '../schemas/user.mjs'; // Assurez-vous que le chemin vers votre modèle User est correct
import FriendRequest from '../schemas/friendRequest.mjs'; // Assurez-vous que le chemin vers votre modèle FriendRequest est correct
import Contact from '../schemas/contact.mjs'; // Assurez-vous que le chemin vers votre modèle Contact est correct
import Conversation from '../schemas/conversation.mjs';

const router = Router();

router.post('/friend-request', async (req, res) => {
  const { requesterEmail, recipientEmail } = req.body;

  try {
    if (requesterEmail === recipientEmail) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer une demande d\'amitié à vous-même' });
    }

    const requester = await User.findOne({ email: requesterEmail });
    if (!requester) {
      return res.status(404).json({ message: 'Utilisateur demandeur non trouvé' });
    }

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Utilisateur destinataire non trouvé' });
    }

    const contactExists = await Contact.findOne({
      user: requester._id,
      'friends.friend': recipient._id,
    });

    if (contactExists) {
      return res.status(400).json({ message: 'Vous êtes déjà en contact avec cet utilisateur' });
    }

    const existingRequest = await FriendRequest.findOne({
      requester: requester._id,
      recipient: recipient._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Une demande d\'amitié existe déjà entre ces utilisateurs' });
    }

    const newRequest = new FriendRequest({
      requester: requester._id,
      recipient: recipient._id,
    });

    await newRequest.save();

    res.status(201).json({ message: 'Demande d\'amitié envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande d\'amitié:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande d\'amitié' });
  }
});
router.post('/friend-request/respond', async (req, res) => {
  const { requestId, response } = req.body;

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Demande d\'amitié introuvable' });
    }

    if (response === 'accept') {
      friendRequest.status = 'accepted';
      await friendRequest.save();

      const participants = [friendRequest.requester, friendRequest.recipient];
      const newConversation = new Conversation({ participants });
      await newConversation.save();

      await Promise.all([
        Contact.findOneAndUpdate(
          { user: friendRequest.requester },
          { $addToSet: { friends: { friend: friendRequest.recipient, conversation: newConversation._id } } },
          { upsert: true }
        ),
        Contact.findOneAndUpdate(
          { user: friendRequest.recipient },
          { $addToSet: { friends: { friend: friendRequest.requester, conversation: newConversation._id } } },
          { upsert: true }
        ),
      ]);

      await FriendRequest.findByIdAndDelete(requestId);

      res.status(200).json({ message: 'Demande d\'amitié acceptée avec succès' });
    } else if (response === 'decline') {
      await FriendRequest.findByIdAndDelete(requestId);
      res.status(200).json({ message: 'Demande d\'amitié refusée avec succès' });
    } else {
      res.status(400).json({ message: 'Réponse non valide' });
    }
  } catch (error) {
    console.error('Erreur lors de la réponse à la demande d\'amitié:', error);
    res.status(500).json({ message: 'Erreur lors de la réponse à la demande d\'amitié' });
  }
});
router.get('/friend-requests/requester/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const friendRequests = await FriendRequest.find({ requester: userId });

    res.status(200).json(friendRequests);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes d\'amitié pour l\'utilisateur en tant que requester:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes d\'amitié pour l\'utilisateur en tant que requester' });
  }
});

router.get('/friend-requests/recipient/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const friendRequests = await FriendRequest.find({ recipient: userId });

    res.status(200).json(friendRequests);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes d\'amitié pour l\'utilisateur en tant que recipient:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes d\'amitié pour l\'utilisateur en tant que recipient' });
  }
});
export default router;
