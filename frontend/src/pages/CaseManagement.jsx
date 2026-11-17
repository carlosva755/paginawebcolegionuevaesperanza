import React, { useState, useEffect } from 'react';
import { acompanamientoApi } from '../services/api';
import {
  FolderHeart,
  PlusCircle,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  FileText,
  User,
  Check
} from 'lucide-react';

export const CaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    assignedTo: 'Lic. María Paula Restrepo',
    roleResponsible: 'Orientador',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [notificationData, setNotificationData] = useState({
    recipientName: '',
    recipientContact: '',
    contactChannel: 'WhatsApp',
    messageContent: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await acompanamientoApi.get('/cases');
      setCases(res.data);
      if (res.data.length > 0 && !selectedCase) {
        loadCaseDetail(res.data[0].id);
      }
    } catch (err) {
      console.error('Error cargando casos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetail = async (caseId) => {
    try {
      const res = await acompanamientoApi.get(`/cases/${caseId}`);
      setSelectedCase(res.data);
    } catch (err) {
      console.error('Error al cargar detalle del caso:', err);
    }
  };

  const handleAddActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await acompanamientoApi.post(`/cases/${selectedCase.id}/actions`, newAction);
      setActionModalOpen(false);
      setNewAction({
        title: '',
        description: '',
        assignedTo: 'Lic. María Paula Restrepo',
        roleResponsible: 'Orientador',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setSuccessMsg('Acción añadida al plan de intervención exitosamente.');
      await loadCaseDetail(selectedCase.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error creando acción:', err);
    }
  };

  const handleCompleteAction = async (actionId) => {
    const evidence = prompt('Ingrese el resumen de evidencia o resultado del seguimiento:');
    if (!evidence) return;

    try {
      await acompanamientoApi.patch(`/cases/${selectedCase.id}/actions/${actionId}`, {
        status: 'Completada',
        evidenceDescription: evidence
      });
      setSuccessMsg('Acción completada con evidencia registrada.');
      await loadCaseDetail(selectedCase.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error actualizando acción:', err);
    }
  };

  const handleSendNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await acompanamientoApi.post('/notifications', {
        caseId: selectedCase.id,
        studentName: selectedCase.studentName,
        recipientType: 'Acudiente',
        recipientName: notificationData.recipientName,
        recipientContact: notificationData.recipientContact,
        contactChannel: notificationData.contactChannel,
        messageContent: notificationData.messageContent
      });

      setNotificationModalOpen(false);
      setSuccessMsg(`Notificación enviada por canal autorizado a ${notificationData.recipientName}.`);
      await loadCaseDetail(selectedCase.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error enviando notificación:', err);
    }
  };

  const openNotifyModal = () => {
    setNotificationData({
      recipientName: 'Acudiente de ' + selectedCase.studentName,
      recipientContact: '310' + Math.floor(1000000 + Math.random() * 9000000),
      contactChannel: 'WhatsApp',
      messageContent: `Cordial saludo desde Orientación IED Nueva Esperanza. Nos comunicamos para concertar un espacio de apoyo para ${selectedCase.studentName}.`
    });
    setNotificationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestión de Casos y Planes de Acompañamiento</h1>
        <p className="text-sm text-slate-500 mt-1">
          Seguimiento individualizado, intervenciones multidisciplinarias y comunicación con familias
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Listado de Casos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Casos Registrados ({cases.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Cargando casos...</div>
          ) : (
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => loadCaseDetail(c.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'border-brand-900 bg-brand-50/60 shadow-sm'
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900">{c.studentName}</span>
                      <span className="text-xs font-bold text-brand-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {c.studentGrade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.openingReason}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[11px]">
                      <span className={`font-semibold ${
                        c.priority === 'Alta' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        Prioridad {c.priority}
                      </span>
                      <span className="text-slate-500 font-medium">{c.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalle del Caso Seleccionado */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCase ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Encabezado del Caso */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selectedCase.studentName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                      {selectedCase.studentGrade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Orientador responsable: <span className="font-semibold text-slate-700">{selectedCase.assignedOrientadorName || 'Lic. María Paula Restrepo'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openNotifyModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Contactar Acudiente
                  </button>

                  <button
                    onClick={() => setActionModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 transition shadow"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Nueva Acción
                  </button>
                </div>
              </div>

              {/* Meta de Intervención Formativa */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-brand-800" />
                  Propósito del Plan de Acompañamiento
                </p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedCase.humanInterventionGoal}
                </p>
              </div>

              {/* Plan de Intervención: Acciones y Evidencias */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Acciones del Plan de Intervención
                </h3>

                {selectedCase.actions && selectedCase.actions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCase.actions.map((act) => (
                      <div
                        key={act.id}
                        className={`p-4 rounded-xl border transition ${
                          act.status === 'Completada'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                act.status === 'Completada' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}></span>
                              <h4 className="text-sm font-bold text-slate-800">{act.title}</h4>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {act.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                              <span>Responsable: <strong className="text-slate-700">{act.assignedTo}</strong></span>
                              <span>Plazo: <strong className="text-slate-700">{new Date(act.dueDate).toLocaleDateString()}</strong></span>
                            </div>
                          </div>

                          <div>
                            {act.status === 'Completada' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <Check className="w-3.5 h-3.5" /> Hecha
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCompleteAction(act.id)}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-semibold text-slate-700 transition"
                              >
                                Registrar Avance
                              </button>
                            )}
                          </div>
                        </div>

                        {act.evidenceDescription && (
                          <div className="mt-3 pt-3 border-t border-emerald-200/60 text-xs text-emerald-900 bg-white/60 p-2.5 rounded-lg">
                            <span className="font-bold">Evidencia / Resultado:</span> {act.evidenceDescription}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 p-6 text-center border border-dashed rounded-xl">
                    No se han definido acciones para este caso aún. Haga clic en "Nueva Acción".
                  </p>
                )}
              </div>

              {/* Historial de Notificaciones Enviadas */}
              {selectedCase.notifications && selectedCase.notifications.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Comunicaciones Enviadas a Acudientes
                  </h3>
                  <div className="space-y-2">
                    {selectedCase.notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {n.recipientName} ({n.contactChannel} - {n.recipientContact})
                          </p>
                          <p className="text-slate-500 mt-0.5">{n.messageContent}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {n.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Seleccione un caso para ver su detalle e historial de intervención.
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Acción */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Nueva Acción para {selectedCase?.studentName}
            </h3>
            <form onSubmit={handleAddActionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Título de la Acción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Entrevista pedagógica con acudiente"
                  value={newAction.title}
                  onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Descripción Detallada</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detallar compromisos o actividades específicas..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Responsable Asignado</label>
                <input
                  type="text"
                  required
                  value={newAction.assignedTo}
                  onChange={(e) => setNewAction({ ...newAction, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  required
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold shadow"
                >
                  Guardar Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enviar Notificación */}
      {notificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Enviar Mensaje a Acudiente
            </h3>
            <form onSubmit={handleSendNotificationSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Acudiente</label>
                <input
                  type="text"
                  required
                  value={notificationData.recipientName}
                  onChange={(e) => setNotificationData({ ...notificationData, recipientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Canal Autorizado</label>
                  <select
                    value={notificationData.contactChannel}
                    onChange={(e) => setNotificationData({ ...notificationData, contactChannel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="CorreoElectronico">Correo</option>
                    <option value="CitacionPresencial">Citación Oficial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Número de Contacto</label>
                  <input
                    type="text"
                    required
                    value={notificationData.recipientContact}
                    onChange={(e) => setNotificationData({ ...notificationData, recipientContact: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Contenido del Mensaje</label>
                <textarea
                  required
                  rows={3}
                  value={notificationData.messageContent}
                  onChange={(e) => setNotificationData({ ...notificationData, messageContent: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Notificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
