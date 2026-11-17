require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { sequelize } = require('./models');
const { seedAcompanamientoData } = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Global security headers and utilities
app.use(helmet());
app.use(cors({
  origin: '*', // Allow cross-origin requests from containerized React frontend
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Container health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'acompanamiento-service',
    timestamp: new Date().toISOString()
  });
});

// Mount versioned REST API routes (/api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', dashboardRoutes); // Institutional alias for /reports/retention

// Centralized error handling middleware
app.use(errorHandler);

// Database initialization with retry loop for Docker Compose orchestration
async function startServer() {
  let retries = 10;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('PostgreSQL connection established successfully (acompanamiento_db).');
      
      // Synchronize database models
      await sequelize.sync({ alter: true });
      console.log('Accompaniment models synchronized.');

      // Seed initial test data
      await seedAcompanamientoData();

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Accompaniment microservice listening on port ${PORT}`);
      });
      break;
    } catch (error) {
      retries--;
      console.warn(`Waiting for PostgreSQL... Retries remaining: ${retries}`, error.message);
      if (retries === 0) {
        console.error('Fatal error connecting to PostgreSQL:', error);
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

// Start HTTP server only if not in Jest test execution
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
