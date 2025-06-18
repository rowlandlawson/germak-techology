import User from '../models/User.js';
import crypto from 'crypto';
import sendVerificationEmail from '../utils/sendEmail.js';
import passport from 'passport';
import path from 'path';
import fs from 'fs';

// Render pages
export const renderHome = (req, res) => res.render('home');
export const renderRegister = (req, res) => res.render('users/register');
export const renderLogin = (req, res) => res.render('users/login');
export const renderVerify = (req, res) => res.render('users/verify', {
  email: req.user?.username,
  error: null,
  messages: req.flash()
});
export const renderDashboard = (req, res) => res.render('users/user_dashboard', { user: req.user });
export const renderForgot = (req, res) => res.render('users/forgot');
export const renderReset = (req, res) => res.render('users/reset', { token: req.params.token });

// upload images
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'No file uploaded');
      return res.redirect('/user_dashboard');
    }

    const user = await User.findById(req.user._id);

    // Delete old photo if it exists and is local
    if (user.photo && user.photo.startsWith('/uploads/')) {
      const oldPath = path.join('public', user.photo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new path
    user.photo = `/uploads/${req.file.filename}`;
    await user.save();

    req.flash('success', 'Profile photo updated successfully!');
    res.redirect('/user_dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong');
    res.redirect('/user_dashboard');
  }
};


// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, phone, password } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Use fullName as displayName if provided
    let displayName = fullName?.trim();

    // ✅ If no full name or it's empty, generate name from email
    if (!displayName) {
      const emailName = username.split('@')[0]; // before @
      displayName = emailName
        .replace(/[0-9]/g, '') // remove numbers
        .split(/[._]/g)        // split on dot or underscore
        .filter(Boolean)       // remove empty parts
        .map(name => name.charAt(0).toUpperCase() + name.slice(1))
        .join(' ') || 'User';
    }

    // ✅ Register new user
    const user = await User.register(
      { username, phone, displayName, verificationCode: code },
      password
    );

    await sendVerificationEmail(username, code, `Your verification code is: <b>${code}</b>`);

    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/register');
      }
      req.flash('success', 'Registration successful! A verification code has been sent to your email.');
      res.redirect('/verify');
    });

  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed. Email may already be in use or input is invalid.');
    res.redirect('/register');
  }
};



// LOGIN
export const loginUser = (req, res) => {
  if (!req.user.isVerified) {
    req.flash('error', 'Account not verified. Please check your email for the code.');
    return res.redirect('/verify');
  }

  req.flash('success', `Login successful. Welcome back`);
  res.redirect('/user_dashboard');
};


// LOGOUT
export const logoutUser = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out successfully.');
    res.redirect('/');
  });
};

// VERIFY
export const verifyCode = async (req, res) => {
  const { code } = req.body;

  if (!req.user) {
    req.flash('error', 'Session expired. Please log in again.');
    return res.redirect('/login');
  }

  if (req.user.verificationCode === code) {
    req.user.isVerified = true;
    req.user.verificationCode = undefined;
    await req.user.save();
    req.flash('success', 'Verification successful. Your account is now verified.');
    return res.redirect('/user_dashboard');
  }

  req.flash('error', 'Incorrect verification code. Please try again.');
  res.redirect('/verify');
};

// RESEND VERIFICATION
export const resendCode = async (req, res) => {
  try {
    if (!req.user) {
      req.flash('error', 'You must be logged in to resend the code.');
      return res.redirect('/login');
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.verificationCode = newCode;
    req.user.isVerified = false;
    await req.user.save();

    await sendVerificationEmail(req.user.username, newCode, `Your new verification code is: <b>${newCode}</b>`);

    req.flash('success', 'A new verification code has been sent to your email.');
    res.redirect('/verify');
  } catch (error) {
    console.error('Error resending code:', error);
    req.flash('error', 'Failed to resend verification code. Please try again.');
    res.redirect('/verify');
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    req.flash('error', 'No account found with that email.');
    return res.redirect('/forgot');
  }
  

  const token = crypto.randomBytes(6).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const protocol = req.protocol === 'https' || process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const resetLink = `${protocol}://${req.headers.host}/reset/${token}`;

  // await sendVerificationEmail(user.username, token, `Reset your password here: <a href="${resetLink}">${resetLink}</a>`);
  await sendVerificationEmail(user.username, token, `
  You requested a password reset. Use this token: <b>${token}</b>
  <br><br>
  Or click the link: <a href="${resetLink}">${resetLink}</a>
`);


  req.flash('success', 'A password reset link has been sent to your email.');
  res.redirect('/reset');
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { username, token, password } = req.body;

  try {
    const user = await User.findOne({
      username,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash('error', 'Invalid token or email, or token expired.');
      return res.redirect('/reset');
    }

    // Set new password
    await new Promise((resolve, reject) => {
      user.setPassword(password, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Automatically log the user in after password reset
    req.logIn(user, (err) => {
      if (err) {
        req.flash('error', 'Password reset successful, but automatic login failed. Please log in manually.');
        return res.redirect('/login');
      }

      req.flash('success', 'Password reset and login successful.');
      return res.redirect('/user_dashboard');
    });

  } catch (err) {
    console.error('Password reset error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/reset');
  }
};


// GOOGLE AUTH
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err || !user) {
      req.flash('error', 'Google login failed. Please try again.');
      return res.redirect('/login');
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    req.logIn(user, (err) => {
      if (err) {
        req.flash('error', 'Login failed. Please try again.');
        return res.redirect('/login');
      }
      req.flash('success', 'Logged in with Google successfully.');
      return res.redirect('/user_dashboard');
    });
  })(req, res, next);
};
