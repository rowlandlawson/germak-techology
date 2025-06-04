import User from '../models/User.js';
import crypto from 'crypto';
import sendVerificationEmail from '../utils/sendEmail.js';
import passport from 'passport';

// Render pages
export const renderHome = (req, res) => res.render('home');
export const renderRegister = (req, res) => res.render('register');
export const renderLogin = (req, res) => res.render('login');
export const renderVerify = (req, res) => res.render('verify', {
  email: req.user?.username,
  error: null,
  messages: req.flash()
});
export const renderDashboard = (req, res) => res.render('user_dashboard', { user: req.user });
export const renderForgot = (req, res) => res.render('forgot');
export const renderReset = (req, res) => res.render('reset', { token: req.params.token });

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.register({ username,code }, password);

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
  req.flash('success', 'Login successful. Welcome back!');
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

  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const protocol = req.protocol === 'https' || process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const resetLink = `${protocol}://${req.headers.host}/reset/${token}`;

  await sendVerificationEmail(user.username, 'Password Reset', `Reset your password here: <a href="${resetLink}">${resetLink}</a>`);

  req.flash('success', 'A password reset link has been sent to your email.');
  res.redirect('/login');
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Reset link is invalid or has expired.');
    return res.redirect('/forgot');
  }

  try {
    await new Promise((resolve, reject) => {
      user.setPassword(req.body.password, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('success', 'Your password has been reset. You can now log in.');
    res.redirect('/login');
  } catch (err) {
    console.error('Password reset error:', err);
    req.flash('error', 'Failed to reset password. Please try again.');
    res.redirect('/forgot');
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
