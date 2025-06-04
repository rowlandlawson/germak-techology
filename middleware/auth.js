import User from "../models/User.js";
import Admin from "../models/admin.js";

export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be logged in to access this page.');
  res.redirect('/login');
};

export const ensureVerified = (req, res, next) => {
  if (req.user?.isVerified) return next();
  req.flash('error', 'Please verify your email to access this page.');
  res.redirect('/verify');
};

// middleware/isLoggedIn.js
export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// middleware/isVerified.js
export const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) return next();
  res.redirect('/verify');
};
