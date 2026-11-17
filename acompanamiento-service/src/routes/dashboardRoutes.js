const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Institutional retention and accompaniment indicators
router.get(
  '/indicators',
  authorizeRoles('Directivo', 'Orientador', 'Administrador', 'Docente'),
  dashboardController.getIndicators
);

// Institutional alias for retention indicators (/reports/retention)
router.get(
  '/retention',
  authorizeRoles('Directivo', 'Orientador', 'Administrador'),
  dashboardController.getIndicators
);

module.exports = router;
