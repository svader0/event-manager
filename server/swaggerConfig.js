const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Manager API',
            version: '1.0.0',
            description: 'API documentation for Event Manager',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;