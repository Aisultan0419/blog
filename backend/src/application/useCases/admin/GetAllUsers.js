class GetAllUsers {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(filters = {}) {
        return await this.userRepository.findAll(filters);
    }
}

module.exports = GetAllUsers;
