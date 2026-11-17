const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 
  'postgres://postgres:postgres_secure_pass_2026@postgres:5432/acompanamiento_db';

// Initialize Sequelize connection pool for PostgreSQL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
