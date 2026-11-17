const { Notification, Case } = require('../models');

/**
 * Dispatches or records a notification to guardians or teachers through an authorized channel.
 * (Authorized roles: Orientador, Directivo, Administrador)
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const {
      caseId,
      studentName,
      recipientType,
      recipientName,
      recipientContact,
      contactChannel,
      messageContent
    } = req.body;

    if (!recipientName || !recipientContact || !messageContent) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'recipientName, recipientContact y messageContent son obligatorios.'
      });
    }

    if (caseId) {
      const caseExists = await Case.findByPk(caseId);
      if (!caseExists) {
        return res.status(404).json({ error: 'El caso especificado no existe.' });
      }
    }

    const notification = await Notification.create({
      caseId: caseId || null,
      studentName: studentName || 'Estudiante',
      recipientType: recipientType || 'Acudiente',
      recipientName,
      recipientContact,
      contactChannel: contactChannel || 'WhatsApp',
      messageContent,
      status: 'Enviado',
      sentAt: new Date()
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves audit log of sent family and school communications.
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { caseId } = req.query;
    const where = {};
    if (caseId) where.caseId = caseId;

    const notifications = await Notification.findAll({
      where,
      order: [['sentAt', 'DESC']],
      limit: 50
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
