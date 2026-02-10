const { MongoClient } = require('mongodb');

let client;
let db;

const connect = async () => {
    if (!client) {
        try {
            client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
            await client.connect();
            db = client.db(process.env.DB_NAME || 'blogging_db');
            console.log('✅ MongoDB connected successfully');
            
            await createIndexes();
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }
    return db;
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not connected. Call connect() first.');
    }
    return db;
};

const createIndexes = async () => {
    try {
        const database = getDB();
        
        await database.collection('users').createIndex({ email: 1 }, { unique: true });
        await database.collection('users').createIndex({ username: 1 }, { unique: true });
        
        await database.collection('blog_posts').createIndex({ author: 1 });
        await database.collection('blog_posts').createIndex({ createdAt: -1 });
        
        await database.collection('comments').createIndex({ postId: 1, createdAt: -1 });
        await database.collection('comments').createIndex({ author: 1 });
        
        await database.collection('categories').createIndex({ slug: 1 }, { unique: true });
        
        await database.collection('likes').createIndex({ userId: 1, postId: 1 }, { unique: true });
        await database.collection('likes').createIndex({ postId: 1 });
        
        console.log('✅ Database indexes created');
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
    }
};

const disconnect = async () => {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('✅ MongoDB disconnected');
    }
};

module.exports = { connect, getDB, disconnect };
