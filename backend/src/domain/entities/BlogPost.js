class BlogPost {
    constructor({ id, title, body, author, categories = [], tags = [], createdAt, updatedAt, isPublished = true }) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.author = author;
        this.categories = categories;
        this.tags = tags;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || this.createdAt;
        this.isPublished = isPublished;
    }
}

module.exports = BlogPost;
