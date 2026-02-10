const CommentDTO = require('../../dto/CommentDTO');

class CreateComment {
    constructor(commentRepository, userRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    async execute(commentDTO, authorId) {
        const user = await this.userRepository.findById(authorId);
        if (!user) {
            throw new Error('User not found');
        }

        const comment = {
            content: commentDTO.content,
            author: authorId,
            postId: commentDTO.postId
        };

        return await this.commentRepository.create(comment);
    }
}

module.exports = CreateComment;
