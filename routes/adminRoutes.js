import express from "express";
import {
  showAdminLogin, handleAdminLogin, showAdminDashboard
} from "../controllers/adminController.js";
import { ensureAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/login", showAdminLogin);
router.post("/login", handleAdminLogin);
router.get("/dashboard", ensureAdminAuthenticated, showAdminDashboard);

export default router;
