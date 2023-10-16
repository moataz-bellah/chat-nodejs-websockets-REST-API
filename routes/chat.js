const express = require('express');
const chatController = require('../controllers/chat');
const isAuth = require('../middlewares/is-auth');
const router = express.Router();
router.get('/friends',isAuth,chatController.getFriends);
router.post('/send',isAuth,chatController.sendMessage);
router.post('/messages',isAuth,chatController.getMessages);
router.get('/people',isAuth,chatController.getPeople);
module.exports = router;