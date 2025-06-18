import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import Admin from "../models/admin.js";

const configurePassport = () => {
  // Register local strategies
  passport.use('user-local', User.createStrategy());
  passport.use('admin-local', Admin.createStrategy());

  // Serialize based on user role
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, role: user.role || 'user' }); // default to 'user' if not set
  });

  // Deserialize based on role
  passport.deserializeUser(async (key, done) => {
    try {
      if (key.role === 'admin') {
        const admin = await Admin.findById(key.id);
        return done(null, admin);
      } else {
        const user = await User.findById(key.id);
        return done(null, user);
      }
    } catch (err) {
      return done(err);
    }
  });

  // Google OAuth strategy for users
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:4000/auth/google/germak-technology",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });
          if (existingUser) return done(null, existingUser);

          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            photo: profile.photos?.[0]?.value,
            username: `google_${profile.displayName}`,
          });
          await newUser.save();
          done(null, newUser);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};

export default configurePassport;
