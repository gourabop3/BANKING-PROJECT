const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const SupportController = require("../../controller/SupportController");

// Public chat endpoint (no authentication required)
router.post("/chat/public", SupportController.chat);

// Authenticated chat endpoint (enhanced with user context)
router.post("/chat", AuthMiddleware, SupportController.chatAuthenticated);

module.exports = router;