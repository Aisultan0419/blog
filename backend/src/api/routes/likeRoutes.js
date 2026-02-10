const express = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');
const authMiddlewareOptional = require('../middleware/authMiddlewareOptional'); 

const router = express.Router();

router.get('/:postId/likes', authMiddlewareOptional, likeController.getPostLikes);


router.use(authMiddleware);
router.post('/:postId/likes', likeController.toggleLike);

module.exports = router;
