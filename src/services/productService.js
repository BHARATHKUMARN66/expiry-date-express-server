const productDao = require('../dao/productDao');

const productService = {
    listProducts: async ({ userId, page = 1, limit = 20, search, expiryFilter }) => {
        const query = { userId };

        // Handle Search (Regex match on title, exact match on upc)
        if (search) {
            const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape regex chars
            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { upc: search }
            ];
        }

        // Handle Expiry Filters
        if (expiryFilter) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // start of today

            if (expiryFilter === '1month') {
                const targetDate = new Date(today);
                targetDate.setMonth(today.getMonth() + 1);
                query.expiryDate = { $gte: today, $lte: targetDate };
            } else if (expiryFilter === '3months') {
                const targetDate = new Date(today);
                targetDate.setMonth(today.getMonth() + 3);
                query.expiryDate = { $gte: today, $lte: targetDate };
            } else if (expiryFilter === 'expired') {
                query.expiryDate = { $lt: today };
            }
        }

        const skip = (page - 1) * limit;
        const sort = { expiryDate: 1 }; // nearest expiry first

        const [products, total] = await Promise.all([
            productDao.findProducts(query, sort, skip, limit),
            productDao.countProducts(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            products,
            total,
            page,
            limit,
            totalPages
        };
    },

    addProduct: async (userId, productData) => {
        const { title, upc, amount, expiryDate, category } = productData;
        
        return await productDao.createProduct({
            userId,
            title,
            upc: upc || null,
            amount: amount || '1',
            expiryDate: new Date(expiryDate),
            category: category || 'Fridge'
        });
    },

    updateProduct: async (id, userId, productData) => {
        const { title, upc, amount, expiryDate, category } = productData;
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (upc !== undefined) updateData.upc = upc || null;
        if (amount !== undefined) updateData.amount = amount || '1';
        if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
        if (category !== undefined) updateData.category = category;

        const updated = await productDao.updateProduct(id, userId, updateData);
        if (!updated) {
            const error = new Error('Product not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        return updated;
    },

    deleteProduct: async (id, userId) => {
        const deleted = await productDao.deleteProduct(id, userId);
        if (!deleted) {
            const error = new Error('Product not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }
        return deleted;
    }
};

module.exports = productService;
