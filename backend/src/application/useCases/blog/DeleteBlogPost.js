class DeleteBlogPost {
    constructor(blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    async execute(id) {
        const existingPost = await this.blogPostRepository.findById(id);
        if (!existingPost) {
            throw new Error('Blog post not found');
        }

        await this.blogPostRepository.delete(id);
        return { message: 'Blog post deleted successfully' };
    }
}

module.exports = DeleteBlogPost;
