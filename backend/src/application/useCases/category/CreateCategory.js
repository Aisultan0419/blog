const CategoryDTO = require('../../dto/CategoryDTO');

class CreateCategory {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async execute(categoryDTO) {
        if (!categoryDTO.name) {
            throw new Error('Category name is required');
        }

        const existingCategory = await this.categoryRepository.findBySlug(
            categoryDTO.slug || categoryDTO.name.toLowerCase().replace(/\s+/g, '-')
        );

        if (existingCategory) {
            throw new Error('Category with this slug already exists');
        }

        return await this.categoryRepository.create(categoryDTO);
    }
}

module.exports = CreateCategory;
