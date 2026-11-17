const { Case, Action, Notification } = require('../models');

/**
 * Opens a new student accompaniment case associated with an alert or direct referral.
 * (Authorized roles: Orientador, Administrador)
 */
exports.createCase = async (req, res, next) => {
  try {
    const {
      studentId,
      studentName,
      studentGrade,
      riskAlertId,
      openingReason,
      priority,
      humanInterventionGoal
    } = req.body;

    if (!studentId || !studentName || !studentGrade || !openingReason) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'studentId, studentName, studentGrade y openingReason son obligatorios.'
      });
    }

    const newCase = await Case.create({
      studentId,
      studentName,
      studentGrade,
      riskAlertId: riskAlertId || null,
      openingReason,
      priority: priority || 'Media',
      status: 'Abierto',
      assignedOrientadorId: req.user.id,
      assignedOrientadorName: req.user.name,
      humanInterventionGoal: humanInterventionGoal || 'Acompañamiento escolar y psicosocial para garantizar la permanencia educativa.'
    });

    res.status(201).json(newCase);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves case details by ID including associated intervention actions and notifications.
 */
exports.getCaseById = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const caseItem = await Case.findByPk(caseId, {
      include: [
        { model: Action, as: 'actions' },
        { model: Notification, as: 'notifications' }
      ]
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Caso no encontrado.' });
    }

    res.json(caseItem);
  } catch (error) {
    next(error);
  }
};

/**
 * Lists accompaniment cases with optional filters for status, priority, or grade.
 */
exports.getAllCases = async (req, res, next) => {
  try {
    const { status, priority, grade } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (grade) where.studentGrade = grade;

    const cases = await Case.findAll({
      where,
      include: [
        { model: Action, as: 'actions' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(cases);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates case status, priority, or closure notes.
 */
exports.updateCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { status, closureNotes, humanInterventionGoal, priority } = req.body;

    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Caso no encontrado.' });
    }

    if (status) {
      caseItem.status = status;
      if (status.startsWith('Cerrado')) {
        caseItem.closedAt = new Date();
      }
    }
    if (closureNotes !== undefined) caseItem.closureNotes = closureNotes;
    if (humanInterventionGoal !== undefined) caseItem.humanInterventionGoal = humanInterventionGoal;
    if (priority !== undefined) caseItem.priority = priority;

    await caseItem.save();
    res.json(caseItem);
  } catch (error) {
    next(error);
  }
};
