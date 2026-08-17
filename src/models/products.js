const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    upc: {
        type: String,
        trim: true,
        default: null
    },
    amount: {
        type: String,
        trim: true,
        default: '1'
    },
    expiryDate: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['Fridge', 'Pantry', 'Freezer', 'Medicine', 'Other'],
        default: 'Fridge'
    }
}, {
    timestamps: true
});

// Compound index for dashboard: scope to user, sort/filter by expiryDate
productSchema.index({ userId: 1, expiryDate: 1 });

// Indexes for searching
productSchema.index({ userId: 1, title: 1 });
productSchema.index({ userId: 1, upc: 1 });

module.exports = mongoose.model('Product', productSchema);
