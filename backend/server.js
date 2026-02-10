require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connect, disconnect } = require('./src/infrastructure/database/mongodb/connection');

const authRoutes = require('./src/api/routes/authRoutes');
const blogRoutes = require('./src/api/routes/blogRoutes');
const userRoutes = require('./src/api/routes/userRoutes');
const adminRoutes = require('./src/api/routes/adminRoutes');
const commentRoutes = require('./src/api/routes/commentRoutes');
const categoryRoutes = require('./src/api/routes/categoryRoutes');
const likeRoutes = require('./src/api/routes/likeRoutes');
const errorMiddleware = require('./src/api/middleware/errorMiddleware');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: 'Too many requests from this IP, please try again later.'
});

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self' http://localhost:3000 https://cdn.jsdelivr.net data:; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "img-src 'self' data: https:;"
    );
    next();
});

app.use(limiter);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend')));

connect().then(() => {
    console.log('✅ Database connected successfully');
}).catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', commentRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/posts', likeRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        collections: ['users', 'blog_posts', 'comments', 'categories', 'likes']
    });
});
app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        const CONFIG = {
            API_BASE: window.location.hostname === 'localhost' 
                ? 'http://localhost:3000/api'
                : window.location.origin + '/api'
        };
        console.log('API Base URL:', CONFIG.API_BASE);
        const API_BASE = CONFIG.API_BASE;
    `);
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
