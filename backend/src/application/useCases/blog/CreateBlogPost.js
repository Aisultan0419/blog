const BlogPost = require('../../../domain/entities/BlogPost');

class CreateBlogPost {
    constructor(blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    async execute(blogPostDTO, authorId) {
        const blogPost = new BlogPost({
            id: null,
            title: blogPostDTO.title,
            body: blogPostDTO.body,
            author: authorId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return await this.blogPostRepository.create(blogPost);
    }
}

module.exports = CreateBlogPost;
