const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'XTB Clone API',
            version: '1.0.0',
            description: 'Dokumentacja API dla uproszczonego klona giełdy XTB',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Serwer lokalny',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./index.js', './routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;