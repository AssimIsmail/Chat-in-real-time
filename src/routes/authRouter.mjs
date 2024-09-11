// authRouter.mjs
import express from 'express';
import passport from 'passport';
import { postLogout, getProfile } from '../controllers/authController.mjs';

const router = express.Router();

// Route pour l'authentification avec Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: 'http://localhost:5173/app',
  failureRedirect: 'http://localhost:5173/' 
}));
router.post('/logout', postLogout);
router.get('/profile', getProfile);

export default router;
