class Category {
    constructor({ id, name, slug, description, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || this.createdAt;
    }
}

module.exports = Category;
