class IBlogPostRepository {
    async create(blogPost) {}
    async findAll() {}
    async findById(id) {}
    async update(id, blogPost) {}
    async delete(id) {}
}

module.exports = IBlogPostRepository;
