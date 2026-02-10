const { getDB } = require('../connection');
const { ObjectId } = require('mongodb');
const Like = require('../../../../domain/entities/Like');

class LikeRepository {
    constructor() {
        this.collectionName = 'likes';
    }

    async create(like) {
        const db = getDB();
        const doc = {
            ...like,
            createdAt: new Date()
        };
        
        const result = await db.collection(this.collectionName).insertOne(doc);
        return new Like({ ...doc, id: result.insertedId.toString() });
    }

    async findByUserAndPost(userId, postId) {
        const db = getDB();
        const like = await db.collection(this.collectionName).findOne({ userId, postId });
        
        if (!like) return null;
        
        return new Like({
            id: like._id.toString(),
            userId: like.userId,
            postId: like.postId,
            createdAt: like.createdAt
        });
    }

    async deleteByUserAndPost(userId, postId) {
        const db = getDB();
        const result = await db.collection(this.collectionName).deleteOne({ userId, postId });
        return result.deletedCount > 0;
    }

    async countByPost(postId) {
        const db = getDB();
        return await db.collection(this.collectionName).countDocuments({ postId });
    }

    async findByUser(userId) {
        const db = getDB();
        const likes = await db.collection(this.collectionName)
            .find({ userId })
            .toArray();
            
        return likes.map(like => new Like({
            id: like._id.toString(),
            userId: like.userId,
            postId: like.postId,
            createdAt: like.createdAt
        }));
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
        const db = getDB();
        const objectId = new ObjectId(id);
        const result = await db.collection(this.collectionName).deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
            throw new Error('Like not found');
        }
    }
}

module.exports = LikeRepository;
