// app.js
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import flash from 'express-flash';
import methodOverride from "method-override";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import configurePassport from "./config/passport.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB
connectDB();

// Configure Passport
configurePassport();

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Express session (must come before flash)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ThisIsASecret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Flash middleware
app.use(flash());

// ✅ Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", userRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
