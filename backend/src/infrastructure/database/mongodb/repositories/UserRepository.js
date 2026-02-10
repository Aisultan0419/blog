const { getDB } = require('../connection');
const { ObjectId } = require('mongodb');
const User = require('../../../../domain/entities/User');

class UserRepository {
    constructor() {
        this.collectionName = 'users';
    }

    async create(user) {
        const db = getDB();
        const result = await db.collection(this.collectionName).insertOne(user);
        return { ...user, id: result.insertedId.toString() };
    }

    async findByEmail(email) {
        const db = getDB();
        const user = await db.collection(this.collectionName).findOne({ email });
        if (!user) return null;
        return new User({ ...user, id: user._id.toString() });
    }

    async findById(id) {
        const db = getDB();
        const objectId = new ObjectId(id);
        const user = await db.collection(this.collectionName).findOne({ _id: objectId });
        if (!user) return null;
        return new User({ ...user, id: user._id.toString() });
    }

    async findAll(filters = {}) {
        const db = getDB();
        const query = {};
        if (filters.role) query.role = filters.role;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;
        
        const users = await db.collection(this.collectionName).find(query).toArray();
        return users.map(user => new User({ ...user, id: user._id.toString() }));
    }

    async update(id, data) {
        const db = getDB();
        const objectId = new ObjectId(id);
        
        const updateDoc = {
            $set: {
                ...data,
                updatedAt: new Date()
            }
        };

        const result = await db.collection(this.collectionName).updateOne(
            { _id: objectId },
            updateDoc
        );

        if (result.matchedCount === 0) {
            throw new Error('User not found');
        }

        return await this.findById(id);
    }

    async delete(id) {
        const db = getDB();
        const objectId = new ObjectId(id);
        const result = await db.collection(this.collectionName).deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
            throw new Error('User not found');
        }
        
        return { message: 'User deleted successfully' };
    }

    async count(filters = {}) {
        const db = getDB();
        return await db.collection(this.collectionName).countDocuments(filters);
    }

    async groupByRole() {
        const db = getDB();
        return await db.collection(this.collectionName).aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]).toArray();
    }
}

module.exports = UserRepository;
