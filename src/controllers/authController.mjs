import User from '../schemas/user.mjs';

export const postLogout = async (req, res) => {
  try {
    // Update user status if needed (optional)
    await User.findOneAndUpdate(
      { googleId: req.user.googleId },
      { status: 'disconnected' },
      { new: true }
    );

    // Perform logout action
    req.logout((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion :', err);
        return res.status(500).json({ message: 'Échec de la déconnexion' });
      }
      res.status(200).json({ message: 'Déconnexion réussie' });
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    res.status(500).json({ message: 'Échec de la déconnexion' });
  }
};

export const getProfile = (req, res) => {
  if (req.isAuthenticated()) {
    // console.log('Utilisateur authentifié:', req.user);
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
};
