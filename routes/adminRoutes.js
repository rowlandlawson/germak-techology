// routes/adminRoutes.js
import express from 'express';
import passport from 'passport';
import {
  renderLogin,
  renderChangePassword,
  changeAdminPassword,
  renderUpdateEmail,
  updateAdminEmail,
  renderAdminForgot,
  adminForgotPassword,
  renderAdminReset,
  adminResetPassword,
  renderAdminDashboard
} from '../controllers/adminController.js';
import { isAdminLoggedIn } from '../middleware/auth.js';

const router = express.Router();

// LOGIN
router.get('/login', renderLogin);
router.post('/login', passport.authenticate('admin-local', {
  successRedirect: '/admin/dashboard',
  failureRedirect: '/admin/login',
  failureFlash: true
}));


router.get('/dashboard', isAdminLoggedIn, renderAdminDashboard);

// FORGOT PASSWORD
router.get('/forgot', renderAdminForgot);
router.post('/forgot', adminForgotPassword);

// RESET PASSWORD
router.get('/reset/:token', renderAdminReset);
router.post('/reset', adminResetPassword);

// CHANGE PASSWORD
router.get('/change-password', renderChangePassword);
router.post('/change-password', changeAdminPassword);

// UPDATE EMAIL
router.get('/update-email', renderUpdateEmail);
router.post('/update-email', updateAdminEmail);

export default router;
