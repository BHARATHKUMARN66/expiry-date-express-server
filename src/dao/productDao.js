const Product = require('../models/products');

const productDao = {
    findProducts: async (query, sort, skip, limit) => {
        return await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
    },
    countProducts: async (query) => {
        return await Product.countDocuments(query);
    },
    findById: async (id) => {
        return await Product.findById(id);
    },
    createProduct: async (productData) => {
        const product = new Product(productData);
        return await product.save();
    },
    updateProduct: async (id, userId, productData) => {
        return await Product.findOneAndUpdate(
            { _id: id, userId },
            { $set: productData },
            { new: true, runValidators: true }
        );
    },
    deleteProduct: async (id, userId) => {
        return await Product.findOneAndDelete({ _id: id, userId });
    }
};

module.exports = productDao;
