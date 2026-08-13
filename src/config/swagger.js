const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Expiry Date Manager API',
            version: '1.0.0',
            description: 'API documentation for the Expiry Date Manager application',
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Local development server',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
};
