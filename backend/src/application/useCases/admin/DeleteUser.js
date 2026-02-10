class DeleteUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return await this.userRepository.delete(userId);
    }
}

module.exports = DeleteUser;
