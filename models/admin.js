import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false,
    unique: false    
  },
  role: {
    type: String,
    default: 'admin'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Hashing and authentication plugin
adminSchema.plugin(passportLocalMongoose);

export default mongoose.model('Admin', adminSchema);
