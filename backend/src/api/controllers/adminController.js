const GetAllUsers = require('../../application/useCases/admin/GetAllUsers');
const UpdateUserRole = require('../../application/useCases/admin/UpdateUserRole');
const DeleteUser = require('../../application/useCases/admin/DeleteUser');
const GetSystemStats = require('../../application/useCases/admin/GetSystemStats');
const UserRepository = require('../../infrastructure/database/mongodb/repositories/UserRepository');
const BlogPostRepository = require('../../infrastructure/database/mongodb/repositories/BlogPostRepository');

const userRepository = new UserRepository();
const blogPostRepository = new BlogPostRepository();

const getAllUsers = async (req, res, next) => {
    try {
        const getAllUsers = new GetAllUsers(userRepository);
        const filters = {};
        
        if (req.query.role) filters.role = req.query.role;
        if (req.query.active !== undefined) filters.isActive = req.query.active === 'true';
        
        const users = await getAllUsers.execute(filters);
        
        users.forEach(user => delete user.password);
        res.json({ users });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }

        const updateUserRole = new UpdateUserRole(userRepository);
        const user = await updateUserRole.execute(userId, role);

        delete user.password;
        res.json({
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        if (req.user.id === userId) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        const deleteUser = new DeleteUser(userRepository);
        await deleteUser.execute(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getSystemStats = async (req, res, next) => {
    try {
        const getSystemStats = new GetSystemStats(userRepository, blogPostRepository);
        const stats = await getSystemStats.execute();

        res.json({ stats });
    } catch (error) {
        next(error);
    }
};

const manageUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive field is required' });
        }

        const user = await userRepository.update(userId, { isActive });
        delete user.password;

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        next(error);
    }
};

const getAllPosts = async (req, res, next) => {
    try {
        const filters = {};
        
        if (req.query.author) filters.author = req.query.author;
        if (req.query.search) filters.title = req.query.search;
        
        const posts = await blogPostRepository.findAll(filters);
        res.json({ posts });
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        await blogPostRepository.delete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats,
    manageUserStatus,
    getAllPosts,
    deletePost
};
