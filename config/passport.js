// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const configurePassport = () => {
  passport.use(User.createStrategy());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

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
          if (existingUser) {
            return done(null, existingUser);
          } else {
            const newUser = new User({
              googleId: profile.id,
              displayName: profile.displayName,
              photo: profile.photos?.[0]?.value,
              username: `google_${profile.displayName}`,
            });
            await newUser.save();
            done(null, newUser);
          }
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};

export default configurePassport;