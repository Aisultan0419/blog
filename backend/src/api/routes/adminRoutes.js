const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId/status', adminController.manageUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/stats', adminController.getSystemStats);
router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:postId', adminController.deletePost);

module.exports = router;
