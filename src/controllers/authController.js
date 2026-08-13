const { validationResult } = require('express-validator');
const authService = require('../services/authService');

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

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: false, // Set to false for local testing without HTTPS
                domain: 'localhost',
                path: '/'
            });

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

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: false, // Set to false for local testing without HTTPS
                domain: 'localhost',
                path: '/'
            });

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
    }
};

module.exports = authController;
