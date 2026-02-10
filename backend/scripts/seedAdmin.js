require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'blogging_db';

async function seedAdmin() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection('users');
        
        const adminEmail = 'admin@example.com';
        const adminPassword = 'Admin123!';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const existingAdmin = await usersCollection.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const adminUser = {
                username: 'admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await usersCollection.insertOne(adminUser);
            console.log('✅ Admin user created successfully!');
            console.log('📧 Email:', adminEmail);
            console.log('🔑 Password:', adminPassword);
            console.log('👑 Role: admin');
        } else {
            console.log('ℹ️ Admin user already exists');
            console.log('📧 Email:', existingAdmin.email);
            console.log('👑 Role:', existingAdmin.role);
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await client.close();
    }
}

seedAdmin();
