const { getDB } = require('../connection');
const { ObjectId } = require('mongodb');
const Category = require('../../../../domain/entities/Category');

class CategoryRepository {
    constructor() {
        this.collectionName = 'categories';
    }

    async create(category) {
        const db = getDB();
        const now = new Date();
        const doc = {
            ...category,
            slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: now,
            updatedAt: now
        };
        
        const result = await db.collection(this.collectionName).insertOne(doc);
        return new Category({ ...doc, id: result.insertedId.toString() });
    }

    async findAll() {
        const db = getDB();
        const categories = await db.collection(this.collectionName)
            .find()
            .sort({ name: 1 })
            .toArray();
            
        return categories.map(category => new Category({
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        const db = getDB();
        const objectId = new ObjectId(id);
        const category = await db.collection(this.collectionName).findOne({ _id: objectId });
        
        if (!category) return null;
        
        return new Category({
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        });
    }

    async findBySlug(slug) {
        const db = getDB();
        const category = await db.collection(this.collectionName).findOne({ slug });
        
        if (!category) return null;
        
        return new Category({
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        });
    }

    async update(id, data) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
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
            throw new Error('Category not found');
        }

        return await this.findById(id);
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) throw new Error('Invalid id');
        const db = getDB();
        const objectId = new ObjectId(id);
        const result = await db.collection(this.collectionName).deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
            throw new Error('Category not found');
        }
    }

    async count() {
        const db = getDB();
        return await db.collection(this.collectionName).countDocuments();
    }
}

module.exports = CategoryRepository;
