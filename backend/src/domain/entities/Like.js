class Like {
    constructor({ id, userId, postId, createdAt }) {
        this.id = id;
        this.userId = userId;
        this.postId = postId;
        this.createdAt = createdAt || new Date();
    }
}

module.exports = Like;
