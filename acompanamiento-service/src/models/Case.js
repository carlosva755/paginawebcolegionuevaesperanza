const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  studentGrade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  riskAlertId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  openingReason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Abierto', 'EnSeguimiento', 'CerradoExitosa', 'CerradoRemitido'),
    allowNull: false,
    defaultValue: 'Abierto'
  },
  priority: {
    type: DataTypes.ENUM('Alta', 'Media', 'Baja'),
    allowNull: false,
    defaultValue: 'Media'
  },
  assignedOrientadorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedOrientadorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  humanInterventionGoal: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'Acompañamiento integral para garantizar la permanencia y bienestar estudiantil.'
  },
  closureNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'cases',
  timestamps: true
});

module.exports = Case;
