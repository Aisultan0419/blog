const CommentDTO = require('../../application/dto/CommentDTO');
const CreateComment = require('../../application/useCases/comment/CreateComment');
const UpdateComment = require('../../application/useCases/comment/UpdateComment');
const DeleteComment = require('../../application/useCases/comment/DeleteComment');
const CommentRepository = require('../../infrastructure/database/mongodb/repositories/CommentRepository');
const UserRepository = require('../../infrastructure/database/mongodb/repositories/UserRepository');

const commentRepository = new CommentRepository();
const userRepository = new UserRepository();

const createComment = async (req, res, next) => {
    try {
        const commentDTO = new CommentDTO(req.body);
        const createComment = new CreateComment(commentRepository, userRepository);
        
        const comment = await createComment.execute(commentDTO, req.user.id);
        
        res.status(201).json({
            message: 'Comment created successfully',
            comment
        });
    } catch (error) {
        next(error);
    }
};

const getPostComments = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const comments = await commentRepository.findByPostId(postId);
        res.json({ comments });
    } catch (error) {
        next(error);
    }
};

const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const updateComment = new UpdateComment(commentRepository);
        const comment = await updateComment.execute(commentId, content, req.user.id);
        
        res.json({
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const deleteComment = new DeleteComment(commentRepository);
        
        await deleteComment.execute(commentId, req.user.id, req.user.role);
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await commentRepository.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        res.json({ comment });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
    getComment
};
