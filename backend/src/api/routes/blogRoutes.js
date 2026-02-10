const express = require('express');
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBlogPost } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/', authMiddleware, validateBlogPost, blogController.createBlogPost);
router.get('/', blogController.getBlogPosts);
router.get('/:id', blogController.getBlogPostById);
router.put('/:id', authMiddleware, validateBlogPost, blogController.updateBlogPost);
router.delete('/:id', authMiddleware, blogController.deleteBlogPost);

module.exports = router;
