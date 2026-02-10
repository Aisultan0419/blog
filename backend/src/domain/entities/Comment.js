class Comment {
    constructor({ id, content, author, postId, createdAt, updatedAt, isEdited = false }) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.postId = postId;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || this.createdAt;
        this.isEdited = isEdited;
    }
}

module.exports = Comment;
