const express = require('express');
const userController = require('../controllers/userController');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUserUpdate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validateUserUpdate, userController.updateProfile);
router.get('/likes', likeController.getUserLikes); 
router.get('/:userId', userController.getUserById);

module.exports = router;
