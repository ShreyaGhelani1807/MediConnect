// Vercel serverless entry — imports Express app without calling listen()
const app = require('../server');
module.exports = app;