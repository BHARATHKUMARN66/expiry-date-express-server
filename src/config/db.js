const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expiry-date-manager';
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s if MongoDB is not running
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn('Warning: Server is running but MongoDB connection failed. Auth APIs will fail until MongoDB is started.');
    }
};

module.exports = connectDB;
