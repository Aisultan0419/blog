const BlogPostDTO = require('../../application/dto/BlogPostDTO');
const CreateBlogPost = require('../../application/useCases/blog/CreateBlogPost');
const GetBlogPosts = require('../../application/useCases/blog/GetBlogPosts');
const GetBlogPostById = require('../../application/useCases/blog/GetBlogPostById');
const UpdateBlogPost = require('../../application/useCases/blog/UpdateBlogPost');
const DeleteBlogPost = require('../../application/useCases/blog/DeleteBlogPost');
const BlogPostRepository = require('../../infrastructure/database/mongodb/repositories/BlogPostRepository');
const blogPostRepository = new BlogPostRepository();

const createBlogPost = async (req, res, next) => {
    try {
        const blogPostDTO = new BlogPostDTO(req.body);
        const createBlogPost = new CreateBlogPost(blogPostRepository);
        const blogPost = await createBlogPost.execute(blogPostDTO, req.user.id);

        res.status(201).json({
            message: 'Blog post created successfully',
            blogPost
        });
    } catch (error) {
        next(error);
    }
};

const getBlogPosts = async (req, res, next) => {
    try {
        const getBlogPosts = new GetBlogPosts(blogPostRepository);
        const blogPosts = await getBlogPosts.execute();
        res.json({ blogPosts });
    } catch (error) {
        next(error);
    }
};

const getBlogPostById = async (req, res, next) => {
    try {
        const getBlogPostById = new GetBlogPostById(blogPostRepository);
        const blogPost = await getBlogPostById.execute(req.params.id);
        res.json({ blogPost });
    } catch (error) {
        next(error);
    }
};

const updateBlogPost = async (req, res, next) => {
    try {
        const existingPost = await blogPostRepository.findById(req.params.id);
        if (!existingPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        if (existingPost.author !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You are not the author' });
        }

        const blogPostDTO = new BlogPostDTO(req.body);
        const updateBlogPost = new UpdateBlogPost(blogPostRepository);
        const blogPost = await updateBlogPost.execute(req.params.id, blogPostDTO);

        res.json({
            message: 'Blog post updated successfully',
            blogPost
        });
    } catch (error) {
        next(error);
    }
};

const deleteBlogPost = async (req, res, next) => {
    try {
        const existingPost = await blogPostRepository.findById(req.params.id);
        if (!existingPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        if (existingPost.author !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You are not the author' });
        }

        const deleteBlogPost = new DeleteBlogPost(blogPostRepository);
        await deleteBlogPost.execute(req.params.id);

        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBlogPost,
    getBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost
};
