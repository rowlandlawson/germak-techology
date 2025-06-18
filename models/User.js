import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
  // Email
  username: { 
    type: String, 
    unique: true, 
    sparse: true,
    required: true
  },

  // Phone Number
  phone: {
    type: String,
    required: true
  },

  // Display Name (full name or generated)
  displayName: {
    type: String,
    required: true
  },

  // Email Verification
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationCode: { 
    type: String 
  },

  // Google OAuth Fields
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  photo: String,

  // Password Reset Fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Enable passport-local-mongoose for hashing & auth
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'username', // using email as username
  errorMessages: {
    UserExistsError: 'A user with the given email is already registered.'
  }
});

export default mongoose.model('User', userSchema);
