const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recipientType: {
    type: DataTypes.ENUM('Acudiente', 'DocenteDirector', 'ComiteConvivencia'),
    allowNull: false,
    defaultValue: 'Acudiente'
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipientContact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactChannel: {
    type: DataTypes.ENUM('WhatsApp', 'SMS', 'CorreoElectronico', 'CitacionPresencial'),
    allowNull: false,
    defaultValue: 'WhatsApp'
  },
  messageContent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Enviado', 'Entregado', 'Leido', 'Fallido'),
    allowNull: false,
    defaultValue: 'Enviado'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;
