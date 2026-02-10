const ToggleLike = require('../../application/useCases/like/ToggleLike');
const LikeRepository = require('../../infrastructure/database/mongodb/repositories/LikeRepository');

const likeRepository = new LikeRepository();

const toggleLike = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const toggleLike = new ToggleLike(likeRepository);
        
        const result = await toggleLike.execute(req.user.id, postId);
        
        const likesCount = await likeRepository.countByPost(postId);
        
        res.json({
            ...result,
            likesCount
        });
    } catch (error) {
        next(error);
    }
};

const getPostLikes = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const likesCount = await likeRepository.countByPost(postId);
        
        const userLiked = req.user ? 
            !!(await likeRepository.findByUserAndPost(req.user.id, postId)) : 
            false;
        
        res.json({
            likesCount,
            userLiked
        });
    } catch (error) {
        next(error);
    }
};

const getUserLikes = async (req, res, next) => {
    try {
        const likes = await likeRepository.findByUser(req.user.id);
        res.json({ likes });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    toggleLike,
    getPostLikes,
    getUserLikes
};
