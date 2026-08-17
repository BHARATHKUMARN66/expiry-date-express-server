const { validationResult } = require('express-validator');
const productService = require('../services/productService');

const productController = {
    listProducts: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ errors: errors.array() });
            }

            const userId = request.user.id;
            const { page, limit, search, expiryFilter } = request.query;

            const parsedPage = parseInt(page) || 1;
            const parsedLimit = parseInt(limit) || 20;

            const data = await productService.listProducts({
                userId,
                page: parsedPage,
                limit: parsedLimit,
                search,
                expiryFilter
            });

            return response.status(200).json(data);
        } catch (error) {
            console.error('List products error:', error);
            return response.status(error.statusCode || 500).json({
                message: error.message || 'Internal server error'
            });
        }
    },

    addProduct: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ errors: errors.array() });
            }

            const userId = request.user.id;
            const { title, upc, amount, expiryDate, category } = request.body;

            const product = await productService.addProduct(userId, {
                title,
                upc,
                amount,
                expiryDate,
                category
            });

            return response.status(201).json({
                message: 'Product added successfully',
                product
            });
        } catch (error) {
            console.error('Add product error:', error);
            return response.status(error.statusCode || 500).json({
                message: error.message || 'Internal server error'
            });
        }
    },

    updateProduct: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ errors: errors.array() });
            }

            const userId = request.user.id;
            const { id } = request.params;
            const { title, upc, amount, expiryDate, category } = request.body;

            const product = await productService.updateProduct(id, userId, {
                title,
                upc,
                amount,
                expiryDate,
                category
            });

            return response.status(200).json({
                message: 'Product updated successfully',
                product
            });
        } catch (error) {
            console.error('Update product error:', error);
            return response.status(error.statusCode || 500).json({
                message: error.message || 'Internal server error'
            });
        }
    },

    deleteProduct: async (request, response) => {
        try {
            const userId = request.user.id;
            const { id } = request.params;

            await productService.deleteProduct(id, userId);

            return response.status(200).json({
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Delete product error:', error);
            return response.status(error.statusCode || 500).json({
                message: error.message || 'Internal server error'
            });
        }
    }
};

module.exports = productController;
