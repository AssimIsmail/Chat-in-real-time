// passport.mjs

import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../schemas/user.mjs'; // Assurez-vous que le chemin est correct

passport.use(
  new GoogleStrategy(
    {
      clientID: '<YOUR_CLIENT_ID>',
      clientSecret: '<YOUR_CLIENT_SECRET>',
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: email,
            image: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            status: 'connected',
          });
          await user.save();
        } else {
          user.status = 'connected';
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
