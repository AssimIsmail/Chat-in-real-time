import { Router } from 'express';
import Contact from '../schemas/contact.mjs';

const router = Router();

router.get('/contacts/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    //const user = await User.findById(userId);

    const contacts = await Contact.findOne({ user: userId }).populate('friends.friend');

    if (!contacts) {
      return res.status(404).json({ message: "Aucun contact trouvé pour l'utilisateur" });
    }

    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
