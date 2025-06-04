
import express from 'express';
import passport from 'passport';
import {
  renderHome,
  renderRegister,
  renderLogin,
  registerUser,
  loginUser,
  logoutUser,
  renderVerify,
  verifyCode,
  resendCode,
  renderDashboard,
  renderForgot,
  renderReset,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback
} from '../controllers/userController.js';
import { ensureAuthenticated, ensureVerified } from '../middleware/auth.js';

const router = express.Router();

router.get('/', renderHome);
router.get('/register', renderRegister);
router.post('/register', registerUser);
router.get('/login', renderLogin);
// router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),loginUser);
// login route
router.post('/dashboard', passport.authenticate('local', {
  successRedirect: '/user_dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', logoutUser);

router.get('/verify', ensureAuthenticated, renderVerify);
router.post('/verify', ensureAuthenticated, verifyCode);
// router.post('/verify/resend', ensureAuthenticated, resendCode);
router.get('/verify/resend', ensureAuthenticated, resendCode);


router.get('/user_dashboard', ensureAuthenticated, ensureVerified, renderDashboard);

router.get('/forgot', renderForgot);
router.post('/forgot', forgotPassword);
router.get('/reset/:token', renderReset);
router.post('/reset/:token', resetPassword);

router.get("/auth/google", googleAuth);
router.get("/auth/google/germak-technology", ensureAuthenticated, googleCallback);

export default router;
