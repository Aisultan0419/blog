const { MongoClient } = require('mongodb');

let client;
let db;

const connect = async () => {
    if (db) return db;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('❌ MONGODB_URI is not defined');
    }

    try {
        client = new MongoClient(uri);
        await client.connect();

        db = client.db(process.env.DB_NAME || undefined);
        console.log('✅ MongoDB connected successfully');

        await createIndexes();
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not connected. Call connect() first.');
    }
    return db;
};

const createIndexes = async () => {
    const database = getDB();

    await database.collection('users').createIndex({ email: 1 }, { unique: true });
    await database.collection('users').createIndex({ username: 1 }, { unique: true });

    await database.collection('blog_posts').createIndex({ author: 1 });
    await database.collection('blog_posts').createIndex({ createdAt: -1 });

    await database.collection('comments').createIndex({ postId: 1, createdAt: -1 });
    await database.collection('comments').createIndex({ author: 1 });

    await database.collection('categories').createIndex({ slug: 1 }, { unique: true });

    await database.collection('likes').createIndex(
        { userId: 1, postId: 1 },
        { unique: true }
    );

    console.log('✅ Database indexes created');
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
