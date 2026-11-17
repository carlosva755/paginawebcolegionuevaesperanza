const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Action = sequelize.define('Action', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roleResponsible: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Orientador'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'EnProgreso', 'Completada', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  evidenceDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'actions',
  timestamps: true
});

module.exports = Action;
