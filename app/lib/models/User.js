import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    minlength: 6,
    // Not required for OAuth users
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otp: String,
  otpExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// CORRECTED: For async middleware, don't use 'next' parameter
UserSchema.pre('save', async function() {
  // Skip if password is not modified or not provided (OAuth users)
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  // Skip if password is already hashed (starts with $2a$, $2b$, or $2y$)
  if (this.password && this.password.match(/^\$2[aby]\$\d+\$/)) {
    console.log('✅ Password already hashed, skipping...');
    return;
  }

  try {
    console.log('🔒 Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
  } catch (error) {
    console.error('❌ Hashing error:', error);
    throw error; // Throw error instead of calling next(error)
  }
});

// Compare password method (only for local users)
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

// Generate OTP method
UserSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpire = Date.now() + 10 * 60 * 1000;
  console.log(`📧 Generated OTP: ${otp} for ${this.email}`);
  return otp;
};

// Clear existing model to prevent cache issues
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;