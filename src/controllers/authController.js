const { validationResult } = require('express-validator');
const authService = require('../services/authService');

const isProd = process.env.NODE_ENV === 'production';
const getCookieOptions = () => {
    const opts = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'
    };
    if (!isProd) {
        opts.domain = 'localhost';
    }
    return opts;
};

const authController = {
    register: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const { name, email, password } = request.body;
            const { user, token } = await authService.register({ name, email, password });

            response.cookie('jwtToken', token, getCookieOptions());

            return response.status(201).json({
                message: 'User registered successfully',
                user
            });
        } catch (error) {
            console.error('Register error:', error);
            return response.status(error.statusCode || 500).json({
                message: error.message || 'Internal server error'
            });
        }
    },

    login: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const { email, password } = request.body;
            const { user, token } = await authService.login({ email, password });

            response.cookie('jwtToken', token, getCookieOptions());

            return response.status(200).json({
                message: 'User authenticated',
                user
            });
        } catch (error) {
            console.error('Login error:', error);
            return response.status(error.statusCode || 500).json({
                message: error.message || 'Internal server error'
            });
        }
    },

    logout: async (request, response) => {
        try {
            response.clearCookie('jwtToken', getCookieOptions());

            return response.status(200).json({
                message: 'User logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    me: async (request, response) => {
        try {
            return response.status(200).json({
                user: request.user
            });
        } catch (error) {
            console.error('Me query error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = authController;
