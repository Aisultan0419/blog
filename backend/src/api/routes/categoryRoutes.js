const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validateCategory } = require('../middleware/validationMiddleware');

const router = express.Router();


router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getCategory);


router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', validateCategory, categoryController.createCategory);
router.put('/:categoryId', validateCategory, categoryController.updateCategory);
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router;
