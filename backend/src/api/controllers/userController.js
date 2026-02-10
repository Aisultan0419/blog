const UpdateUserProfile = require('../../application/useCases/user/UpdateUserProfile');
const UserUpdateDTO = require('../../application/dto/UserUpdateDTO');
const UserRepository = require('../../infrastructure/database/mongodb/repositories/UserRepository');

const userRepository = new UserRepository();

const updateProfile = async (req, res, next) => {
    try {
        const userUpdateDTO = new UserUpdateDTO(req.body);
        const updateUserProfile = new UpdateUserProfile(userRepository);
        
        const user = await updateUserProfile.execute(req.user.id, userUpdateDTO);
        delete user.password;

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await userRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        delete user.password;
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await userRepository.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        delete user.password;
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    getProfile,
    getUserById
};
