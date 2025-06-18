import User from "../models/User.js";
import Admin from "../models/admin.js";

// Ensure any logged-in user
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be logged in to access this page.');
  res.redirect('/login');
};

// Ensure email is verified
export const ensureVerified = (req, res, next) => {
  if (req.user?.isVerified) return next();
  req.flash('error', 'Please verify your email to access this page.');
  res.redirect('/verify');
};

// Just check if user is logged in (no flash message)
export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// ✅ Fixed syntax error here (was missing "=")
export const isAdminLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/admin/login');
};

// Just check if user is verified (no flash message)
export const isVerified = (req, res, next) => {
  if (req.user?.isVerified) return next();
  res.redirect('/verify');
};
