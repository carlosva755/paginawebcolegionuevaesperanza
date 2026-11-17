const { Action, Case } = require('../models');

/**
 * Creates an intervention action within a case plan.
 * (Authorized roles: Orientador, Administrador)
 */
exports.createAction = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { title, description, assignedTo, roleResponsible, dueDate } = req.body;

    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Caso de acompañamiento no encontrado.' });
    }

    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'title, description, assignedTo y dueDate son obligatorios.'
      });
    }

    const action = await Action.create({
      caseId,
      title,
      description,
      assignedTo,
      roleResponsible: roleResponsible || 'Orientador',
      dueDate: new Date(dueDate),
      status: 'Pendiente'
    });

    // Auto-transition case from 'Abierto' to 'EnSeguimiento' upon first action creation
    if (caseItem.status === 'Abierto') {
      caseItem.status = 'EnSeguimiento';
      await caseItem.save();
    }

    res.status(201).json(action);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates action status, progress, assigned party, or qualitative evidence.
 * (Authorized roles: Responsable asignado, Orientador, Administrador)
 */
exports.updateAction = async (req, res, next) => {
  try {
    const { caseId, actionId } = req.params;
    const { status, evidenceDescription, assignedTo, dueDate } = req.body;

    const action = await Action.findOne({
      where: { id: actionId, caseId }
    });

    if (!action) {
      return res.status(404).json({ error: 'Acción no encontrada para este caso.' });
    }

    if (status) {
      action.status = status;
      if (status === 'Completada') {
        action.completedAt = new Date();
      }
    }
    if (evidenceDescription !== undefined) action.evidenceDescription = evidenceDescription;
    if (assignedTo !== undefined) action.assignedTo = assignedTo;
    if (dueDate !== undefined) action.dueDate = new Date(dueDate);

    await action.save();
    res.json(action);
  } catch (error) {
    next(error);
  }
};
