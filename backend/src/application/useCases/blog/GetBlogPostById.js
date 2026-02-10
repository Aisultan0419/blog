class GetBlogPostById {
    constructor(blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    async execute(id) {
        const blogPost = await this.blogPostRepository.findById(id);
        if (!blogPost) {
            throw new Error('Blog post not found');
        }
        return blogPost;
    }
}

module.exports = GetBlogPostById;
