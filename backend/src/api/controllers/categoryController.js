const CategoryDTO = require('../../application/dto/CategoryDTO');
const CreateCategory = require('../../application/useCases/category/CreateCategory');
const CategoryRepository = require('../../infrastructure/database/mongodb/repositories/CategoryRepository');

const categoryRepository = new CategoryRepository();

const createCategory = async (req, res, next) => {
    try {
        const categoryDTO = new CategoryDTO(req.body);
        const createCategory = new CreateCategory(categoryRepository);
        
        const category = await createCategory.execute(categoryDTO);
        
        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        next(error);
    }
};

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryRepository.findAll();
        res.json({ categories });
    } catch (error) {
        next(error);
    }
};

const getCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const category = await categoryRepository.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ category });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const categoryDTO = new CategoryDTO(req.body);
        
        const category = await categoryRepository.update(categoryId, categoryDTO);
        
        res.json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        await categoryRepository.delete(categoryId);
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory
};
