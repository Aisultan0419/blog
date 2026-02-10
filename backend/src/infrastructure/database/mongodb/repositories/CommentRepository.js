const { getDB } = require('../connection');
const { ObjectId } = require('mongodb');
const Comment = require('../../../../domain/entities/Comment');

class CommentRepository {
    constructor() {
        this.collectionName = 'comments';
    }

    async create(comment) {
        const db = getDB();
        const now = new Date();
        const doc = {
            ...comment,
            createdAt: now,
            updatedAt: now
        };
        
        const result = await db.collection(this.collectionName).insertOne(doc);
        return new Comment({ ...doc, id: result.insertedId.toString() });
    }

    async findAll(filters = {}) {
        const db = getDB();
        const query = {};
        
        if (filters.postId) query.postId = filters.postId;
        if (filters.author) query.author = filters.author;
        
        const comments = await db.collection(this.collectionName)
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
            
        return comments.map(comment => new Comment({
            id: comment._id.toString(),
            content: comment.content,
            author: comment.author,
            postId: comment.postId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            isEdited: comment.isEdited || false
        }));
    }

    async findByPostId(postId) {
    const db = getDB();
    const comments = await db.collection(this.collectionName)
        .aggregate([
            { $match: { postId } },
            { $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'authorData'
            }},
            { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ])
        .toArray();

    return comments.map(comment => new Comment({
        id: comment._id.toString(),
        content: comment.content,
        author: comment.authorData?.username || 'Unknown', // здесь имя
        postId: comment.postId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        isEdited: comment.isEdited || false
        }));
    }
    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        const db = getDB();
        const objectId = new ObjectId(id);
        const comment = await db.collection(this.collectionName).findOne({ _id: objectId });
        
        if (!comment) return null;
        
        return new Comment({
            id: comment._id.toString(),
            content: comment.content,
            author: comment.author, 
            postId: comment.postId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            isEdited: comment.isEdited || false
        });
    }
    async update(id, data) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
        const db = getDB();
        const objectId = new ObjectId(id);
        
        const updateDoc = {
            $set: {
                ...data,
                updatedAt: new Date(),
                isEdited: true
            }
        };

        const result = await db.collection(this.collectionName).updateOne(
            { _id: objectId },
            updateDoc
        );

        if (result.matchedCount === 0) {
            throw new Error('Comment not found');
        }

        return await this.findById(id);
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
        const db = getDB();
        const objectId = new ObjectId(id);
        const result = await db.collection(this.collectionName).deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
            throw new Error('Comment not found');
        }
    }

    async count(filters = {}) {
        const db = getDB();
        return await db.collection(this.collectionName).countDocuments(filters);
    }
}

module.exports = CommentRepository;
