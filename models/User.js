import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
  // Local Auth
  username: { type: String, unique: false, sparse: true }, // Email
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String},

  // Google OAuth
  googleId: { type: String, unique: true, sparse: true },
  displayName: String,
  photo: String,

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Add passport-local-mongoose plugin (handles hash/salt/password)
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'username', // use email as username
  errorMessages: {
    UserExistsError: 'A user with the given email is already registered.'
  }
});

export default mongoose.model('User', userSchema);
