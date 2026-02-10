class UpdateUserRole {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, newRole) {
        const validRoles = ['user', 'admin', 'moderator'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return await this.userRepository.update(userId, { role: newRole });
    }
}

module.exports = UpdateUserRole;
