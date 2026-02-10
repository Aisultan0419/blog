class GetSystemStats {
    constructor(userRepository, blogPostRepository) {
        this.userRepository = userRepository;
        this.blogPostRepository = blogPostRepository;
    }

    async execute() {
        const totalUsers = await this.userRepository.count();
        const totalPosts = await this.blogPostRepository.count();
        const activeUsers = await this.userRepository.count({ isActive: true });
        
        const usersByRole = await this.userRepository.groupByRole();
        
        return {
            totalUsers,
            totalPosts,
            activeUsers,
            usersByRole,
            uptime: process.uptime(),
            timestamp: new Date()
        };
    }
}

module.exports = GetSystemStats;
