const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/userDao');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123!';
const JWT_EXPIRES_IN = '1h';

const authService = {
    register: async ({ name, email, password }) => {
        const existingUser = await userDao.findByEmail(email);
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await userDao.createUser({
            name,
            email,
            password: hashedPassword
        });

        const userObj = user.toObject();
        delete userObj.password;

        const token = jwt.sign({
            name: userObj.name,
            email: userObj.email,
            _id: userObj._id,
            role: 'admin',
            adminId: userObj._id
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return { user: userObj, token };
    },

    login: async ({ email, password }) => {
        const user = await userDao.findByEmail(email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 400;
            throw error;
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            const error = new Error('Invalid email or password');
            error.statusCode = 400;
            throw error;
        }

        const userObj = user.toObject();
        delete userObj.password;

        const token = jwt.sign({
            name: userObj.name,
            email: userObj.email,
            _id: userObj._id,
            role: 'admin',
            adminId: userObj._id
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return { user: userObj, token };
    }
};

module.exports = authService;
