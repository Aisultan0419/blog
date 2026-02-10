class UpdateComment {
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
    }

    async execute(commentId, content, userId) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        if (comment.author !== userId) {
            throw new Error('Not authorized to update this comment');
        }

        return await this.commentRepository.update(commentId, { content });
    }
}

module.exports = UpdateComment;
