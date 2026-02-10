class GetCurrentUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        delete user.password;
        return user;
    }
}

module.exports = GetCurrentUser;
