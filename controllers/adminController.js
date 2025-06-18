import Admin from '../models/admin.js';
import crypto from 'crypto';
import sendVerificationEmail from '../utils/sendEmail.js';
import passport from 'passport';
import validatePasswordStrength from '../utils/validatePasswordStrength.js';

// LOGIN
export const renderLogin = (req, res) => {
  res.render('admin/admin_login', {
    messages: req.flash()
  });
};

export const renderAdminDashboard = (req, res) => {
  res.render('admin/admin_dashboard', {
    messages: req.flash()
  });
};

// DEFAULT ADMIN CREATION
export async function createDefaultAdmin() {
  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const newAdmin = new Admin({ username: 'admin' });
    await Admin.register(newAdmin, 'admin123'); // default password
    console.log('✅ Default admin created: username = admin, password = admin123');
  } else {
    console.log('ℹ️ Default admin already exists.');
  }
}

// RENDER FORGOT PAGE
export const renderAdminForgot = (req, res) => {
  res.render('admin/admin_forgot', extractFlashMessages(req));
};

// RENDER RESET PAGE
export const renderAdminReset = (req, res) => {
  res.render('admin/admin_reset', {
    token: req.params.token,
    ...extractFlashMessages(req),
  });
};

// FORGOT PASSWORD
export const adminForgotPassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      req.flash('error', 'No admin found with that username.');
      return res.redirect('/admin/forgot');
    }

    const token = crypto.randomBytes(6).toString('hex');
    admin.resetPasswordToken = token;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    const protocol = req.protocol === 'https' || process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const resetLink = `${protocol}://${req.headers.host}/admin/reset/${token}`;

    await sendVerificationEmail(
      admin.username,
      token,
      `
        You requested a password reset. Use this token: <b>${token}</b>
        <br><br>
        Or click the link: <a href="${resetLink}">${resetLink}</a>
      `
    );

    req.flash('success', 'A reset link has been sent to your admin email.');
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Admin forgot error:', error);
    req.flash('error', 'Something went wrong. Try again.');
    res.redirect('/admin/forgot');
  }
};

// RESET PASSWORD
export const adminResetPassword = async (req, res) => {
  const { username, token, password } = req.body;

  try {
    const admin = await Admin.findOne({
      username,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      req.flash('error', 'Invalid or expired token.');
      return res.redirect(`/admin/reset/${token}`);
    }

    await new Promise((resolve, reject) => {
      admin.setPassword(password, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    req.logIn(admin, (err) => {
      if (err) {
        req.flash('error', 'Password reset. Please log in manually.');
        return res.redirect('/admin/login');
      }

      req.flash('success', 'Password reset and logged in as admin.');
      res.redirect('/admin/dashboard');
    });

  } catch (err) {
    console.error('Admin reset error:', err);
    req.flash('error', 'Something went wrong. Try again.');
    res.redirect(`/admin/reset/${token}`);
  }
};

// RENDER CHANGE PASSWORD PAGE
export const renderChangePassword = (req, res) => {
  res.render('admin/admin_change_password', extractFlashMessages(req));
};
// CHANGE ADMIN PASSWORD
export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    req.flash('error', '❌ New passwords do not match.');
    return res.redirect('/admin/change-password');
  }

  // Check password strength
  if (!validatePasswordStrength(newPassword)) {
    req.flash('error', '❌ Password must be at least 8 characters long and include uppercase, lowercase, and a number.');
    return res.redirect('/admin/change-password');
  }

  try {
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      req.flash('error', '❌ Admin account not found.');
      return res.redirect('/admin/change-password');
    }

    const isValid = await admin.authenticate(currentPassword);

    if (!isValid.user) {
      req.flash('error', '❌ Current password is incorrect.');
      return res.redirect('/admin/change-password');
    }

    // Set the new password
    await new Promise((resolve, reject) => {
      admin.setPassword(newPassword, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await admin.save();

    // Optionally send notification email
    if (admin.email) {
      await sendVerificationEmail(
        admin.email,
        '',
        `🔐 Your admin password was successfully changed.<br><br>If you did not perform this action, please contact support immediately.`
      );
    }

    req.flash('success', '✅ Password successfully changed.');
    res.redirect('/admin/dashboard');

  } catch (err) {
    console.error('Change password error:', err);
    req.flash('error', '❌ Something went wrong. Please try again.');
    res.redirect('/admin/change-password');
  }
};

// UPDATE EMAIL
export const renderUpdateEmail = (req, res) => {
  res.render('admin/admin_update_email', {
    user: req.user,
    messages: req.flash()
  });
};

export const updateAdminEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) {
      req.flash('error', 'New email is required.');
      return res.redirect('/admin/update-email');
    }

    req.user.email = newEmail;
    await req.user.save();
    req.flash('success', 'Email updated successfully.');
    res.redirect('/admin/update-email');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong.');
    res.redirect('/admin/update-email');
  }
};

