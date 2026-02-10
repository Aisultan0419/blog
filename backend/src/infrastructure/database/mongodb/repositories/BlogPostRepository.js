const { getDB } = require('../connection');
const { ObjectId } = require('mongodb');
const BlogPost = require('../../../../domain/entities/BlogPost');

class BlogPostRepository {
    constructor() {
        this.collectionName = 'blog_posts';
    }

    async create(blogPost) {
        const db = getDB();
        const now = new Date();
        const doc = { ...blogPost, author: blogPost.author, createdAt: now, updatedAt: now };
        const result = await db.collection(this.collectionName).insertOne(doc);
        return new BlogPost({ ...doc, id: result.insertedId.toString() });
    }

    async findAll(filters = {}) {
        const db = getDB();
        let query = {};
        
        if (filters.author) query.author = filters.author;
        if (filters.title) query.title = { $regex: filters.title, $options: 'i' };
        
        const posts = await db.collection(this.collectionName).find(query).toArray();
        return posts.map(post => new BlogPost({
            id: post._id.toString(),
            title: post.title,
            body: post.body,
            author: post.author,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        const db = getDB();
        const objectId = new ObjectId(id);
        const post = await db.collection(this.collectionName).findOne({ _id: objectId });
        if (!post) return null;
        return new BlogPost({
            id: post._id.toString(),
            title: post.title,
            body: post.body,
            author: post.author,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        });
    }

    async update(id, blogPost) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
        const db = getDB();
        const objectId = new ObjectId(id);
        const updateDoc = { ...blogPost, updatedAt: new Date() };
        const result = await db.collection(this.collectionName).updateOne(
            { _id: objectId },
            { $set: updateDoc }
        );
        if (result.matchedCount === 0) {
            throw new Error('Update failed: not found');
        }
        return new BlogPost({ ...updateDoc, id });
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
        const db = getDB();
        const objectId = new ObjectId(id);
        const result = await db.collection(this.collectionName).deleteOne({ _id: objectId });
        if (result.deletedCount === 0) {
            throw new Error('Delete failed');
        }
    }

    async count(filters = {}) {
        const db = getDB();
        return await db.collection(this.collectionName).countDocuments(filters);
    }

    async findAllWithPagination(page = 1, limit = 10) {
        const db = getDB();
        const skip = (page - 1) * limit;
        
        const posts = await db.collection(this.collectionName)
            .find()
            .skip(skip)
            .limit(limit)
            .toArray();
            
        const total = await db.collection(this.collectionName).countDocuments();
        
        return {
            posts: posts.map(post => new BlogPost({
                id: post._id.toString(),
                title: post.title,
                body: post.body,
                author: post.author,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}

module.exports = BlogPostRepository;
