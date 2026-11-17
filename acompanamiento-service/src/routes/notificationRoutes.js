const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.post(
  '/',
  authorizeRoles('Orientador', 'Directivo', 'Administrador'),
  notificationController.sendNotification
);

router.get(
  '/',
  authorizeRoles('Orientador', 'Directivo', 'Administrador'),
  notificationController.getNotifications
);

module.exports = router;
