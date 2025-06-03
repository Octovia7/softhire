const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/authMiddleware');

// api/chat/recentChats
router.get('/recruiter/recentChats', authenticate, chatController.getRecentChats);
// api/chat/:receiverId
router.get('/recruiter/:receiverId', authenticate, chatController.getChatsWithUser);

module.exports = router;