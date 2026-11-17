const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const actionController = require('../controllers/actionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All endpoints require valid JWT authentication
router.use(authenticateToken);

// Case management endpoints
router.post(
  '/',
  authorizeRoles('Orientador', 'Administrador'),
  caseController.createCase
);

router.get(
  '/',
  authorizeRoles('Orientador', 'Directivo', 'Administrador', 'Docente'),
  caseController.getAllCases
);

router.get(
  '/:caseId',
  authorizeRoles('Orientador', 'Directivo', 'Administrador', 'ResponsableAsignado'),
  caseController.getCaseById
);

router.patch(
  '/:caseId',
  authorizeRoles('Orientador', 'Administrador'),
  caseController.updateCase
);

// Intervention plan action endpoints
router.post(
  '/:caseId/actions',
  authorizeRoles('Orientador', 'Administrador'),
  actionController.createAction
);

router.patch(
  '/:caseId/actions/:actionId',
  authorizeRoles('Orientador', 'Administrador', 'ResponsableAsignado', 'Directivo'),
  actionController.updateAction
);

module.exports = router;
