
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
import { upload } from '../middleware/upload.js'; 
import { uploadPhoto } from '../controllers/userController.js';

const router = express.Router();

router.get('/', renderHome);
router.get('/register', renderRegister);
router.post('/register', registerUser);
router.get('/login', renderLogin);
// router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),loginUser);
// login route
router.post('/dashboard', passport.authenticate('user-local', {
  successRedirect: '/user_dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// Upload route
router.post('/upload-photo', ensureAuthenticated, upload.single('photo'), uploadPhoto);


router.get('/logout', logoutUser);

router.get('/verify', ensureAuthenticated, renderVerify);
router.post('/verify', ensureAuthenticated, verifyCode);
// router.post('/verify/resend', ensureAuthenticated, resendCode);
router.get('/verify/resend', ensureAuthenticated, resendCode);


router.get('/user_dashboard', ensureAuthenticated, ensureVerified, renderDashboard);

router.get('/forgot', renderForgot);
router.post('/forgot', forgotPassword);

router.get('/reset', renderReset);
router.post('/reset', resetPassword);

router.get("/auth/google", googleAuth);
router.get("/auth/google/germak-technology", ensureAuthenticated, googleCallback);

export default router;
