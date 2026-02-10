const { body, validationResult } = require('express-validator');

const validateRegistration = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email')
        .isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateBlogPost = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('body')
        .notEmpty().withMessage('Body is required')
        .isLength({ min: 10 }).withMessage('Body must be at least 10 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserUpdate = [
    body('username')
        .optional()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email')
        .optional()
        .isEmail().withMessage('Valid email is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateRoleUpdate = [
    body('role')
        .isIn(['user', 'admin', 'moderator']).withMessage('Invalid role'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateComment = [
    body('content')
        .notEmpty().withMessage('Comment content is required')
        .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    body('postId')
        .notEmpty().withMessage('Post ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCategory = [
    body('name')
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('slug')
        .optional()
        .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateBlogPost,
    validateUserUpdate,
    validateRoleUpdate,
    validateComment,
    validateCategory
};
