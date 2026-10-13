const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Booking System API',
      version: '1.0.0',
      description: 'A comprehensive event management and booking platform built with MERN stack',
      contact: {
        name: 'Developer',
        email: 'your-email@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
  {
    url: '/',
    description: 'Current server',
  },
],
  },
  // Read Swagger docs from separate file
  apis: ['./config/swagger-docs.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  // Swagger UI with custom styling
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Event Booking System API',
    customfavIcon: '/favicon.ico',
  }));

  // JSON endpoint for swagger specification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at http://localhost:5000/api-docs');
};

module.exports = setupSwagger;