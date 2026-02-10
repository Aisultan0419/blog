const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateComment } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/posts/:postId/comments', commentController.getPostComments);
router.get('/comments/:commentId', commentController.getComment);

router.use(authMiddleware);

router.post('/comments', validateComment, commentController.createComment);
router.put('/comments/:commentId', commentController.updateComment);
router.delete('/comments/:commentId', commentController.deleteComment);

module.exports = router;
