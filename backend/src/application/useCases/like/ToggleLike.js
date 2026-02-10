class ToggleLike {
    constructor(likeRepository) {
        this.likeRepository = likeRepository;
    }

    async execute(userId, postId) {
        const existingLike = await this.likeRepository.findByUserAndPost(userId, postId);
        
        if (existingLike) {
            await this.likeRepository.deleteByUserAndPost(userId, postId);
            return { liked: false, message: 'Like removed' };
        } else {
            const like = await this.likeRepository.create({ userId, postId });
            return { liked: true, like, message: 'Like added' };
        }
    }
}

module.exports = ToggleLike;
