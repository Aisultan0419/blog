class DeleteComment {
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
    }

    async execute(commentId, userId, userRole) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        if (comment.author !== userId && userRole !== 'admin') {
            throw new Error('Not authorized to delete this comment');
        }

        return await this.commentRepository.delete(commentId);
    }
}

module.exports = DeleteComment;
