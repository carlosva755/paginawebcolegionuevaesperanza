const sequelize = require('../config/database');
const User = require('./User');
const Case = require('./Case');
const Action = require('./Action');
const Notification = require('./Notification');

// Define model relationships
Case.hasMany(Action, {
  foreignKey: 'caseId',
  as: 'actions',
  onDelete: 'CASCADE'
});
Action.belongsTo(Case, {
  foreignKey: 'caseId',
  as: 'case'
});

Case.hasMany(Notification, {
  foreignKey: 'caseId',
  as: 'notifications',
  onDelete: 'SET NULL'
});
Notification.belongsTo(Case, {
  foreignKey: 'caseId',
  as: 'case'
});

module.exports = {
  sequelize,
  User,
  Case,
  Action,
  Notification
};
