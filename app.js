import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import flash from 'express-flash';
import methodOverride from "method-override";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import configurePassport from "./config/passport.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import User from "./models/User.js";
import { createDefaultAdmin } from './controllers/adminController.js';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multer setup for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user._id}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Start server inside async wrapper
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    await createDefaultAdmin();

    configurePassport();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // Middleware
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));

    app.use(
      session({
        secret: process.env.SESSION_SECRET || "ThisIsASecret",
        resave: false,
        saveUninitialized: false,
      })
    );

    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    // Make user data available to all views
    app.use((req, res, next) => {
      res.locals.user = req.user;
      next();
    });

    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      next();
    });

    // Routes
    app.use("/", userRoutes);
    app.use("/admin", adminRoutes);

    // ✅ Upload photo route
    app.post("/upload-photo", upload.single("photo"), async (req, res) => {
      try {
        if (!req.user) {
          req.flash("error", "Not logged in");
          return res.redirect("/login");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
          req.flash("error", "User not found");
          return res.redirect("/login");
        }

        // Delete previous photo if exists
        if (user.photo && fs.existsSync(path.join(__dirname, 'public', user.photo))) {
          fs.unlinkSync(path.join(__dirname, 'public', user.photo));
        }

        user.photo = `/uploads/${req.file.filename}`;
        await user.save();

        req.flash("success", "Profile photo updated");
        res.redirect("back");
      } catch (err) {
        console.error(err);
        req.flash("error", "Photo upload failed");
        res.redirect("back");
      }
    });

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`✅ Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
