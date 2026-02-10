class UpdateBlogPost {
    constructor(blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    async execute(id, blogPostDTO) {
        const existingPost = await this.blogPostRepository.findById(id);
        if (!existingPost) {
            throw new Error('Blog post not found');
        }

        const updatedPost = {
            ...existingPost,
            title: blogPostDTO.title || existingPost.title,
            body: blogPostDTO.body || existingPost.body,
            updatedAt: new Date()
        };

        return await this.blogPostRepository.update(id, updatedPost);
    }
}

module.exports = UpdateBlogPost;
