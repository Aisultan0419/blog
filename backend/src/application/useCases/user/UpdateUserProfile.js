const UserUpdateDTO = require('../../dto/UserUpdateDTO');

class UpdateUserProfile {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, userUpdateDTO) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedData = {};
        if (userUpdateDTO.username) updatedData.username = userUpdateDTO.username;
        if (userUpdateDTO.email) {
            const existingUser = await this.userRepository.findByEmail(userUpdateDTO.email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email already in use');
            }
            updatedData.email = userUpdateDTO.email;
        }

        return await this.userRepository.update(userId, updatedData);
    }
}

module.exports = UpdateUserProfile;
