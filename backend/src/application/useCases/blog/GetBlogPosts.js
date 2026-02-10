class GetBlogPosts {
    constructor(blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    async execute() {
        return await this.blogPostRepository.findAll();
    }
}

module.exports = GetBlogPosts;
