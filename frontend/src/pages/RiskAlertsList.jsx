import React, { useState, useEffect } from 'react';
import { alertasApi, acompanamientoApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import {
  AlertTriangle,
  RotateCw,
  FolderPlus,
  Filter,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RiskAlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [levelFilter, setLevelFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedAlertForCase, setSelectedAlertForCase] = useState(null);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [openingReason, setOpeningReason] = useState('');
  const [priority, setPriority] = useState('Alta');
  const [actionSuccess, setActionSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, [levelFilter, gradeFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = [];
      if (levelFilter) params.push(`level=${levelFilter}`);
      if (gradeFilter) params.push(`grade=${gradeFilter}`);
      if (params.length > 0) query = `?${params.join('&')}`;

      const res = await alertasApi.get(`/risk-alerts${query}`);
      setAlerts(res.data);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await alertasApi.post('/risk-alerts/recalculate', {});
      await fetchAlerts();
      setActionSuccess('Recálculo de alertas completado exitosamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Error recalculando:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleOpenCaseModal = (alert) => {
    setSelectedAlertForCase(alert);
    setOpeningReason(alert.triggerReason);
    setPriority(alert.level === 'Alto' ? 'Alta' : 'Media');
    setCaseModalOpen(true);
  };

  const handleCreateCaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlertForCase) return;

    try {
      await acompanamientoApi.post('/cases', {
        studentId: selectedAlertForCase.studentId,
        studentName: selectedAlertForCase.studentName,
        studentGrade: selectedAlertForCase.grade,
        riskAlertId: selectedAlertForCase.id,
        openingReason: openingReason,
        priority: priority,
        humanInterventionGoal: 'Intervención integral y seguimiento individualizado para garantizar la permanencia escolar.'
      });

      setCaseModalOpen(false);
      setActionSuccess(`Caso de acompañamiento abierto exitosamente para ${selectedAlertForCase.studentName}.`);
      setTimeout(() => {
        setActionSuccess('');
        navigate('/casos');
      }, 1500);
    } catch (err) {
      console.error('Error abriendo caso:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Listado de Alertas Preventivas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Señales tempranas para priorización del acompañamiento escolar (Soacha)
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? 'Recalculando...' : 'Recalcular Riesgo Masivo'}
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Filtros:
        </div>

        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todos los niveles</option>
            <option value="high">Alerta Alta</option>
            <option value="medium">Alerta Media</option>
            <option value="low">Riesgo Bajo</option>
          </select>
        </div>

        <div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todos los cursos</option>
            {['8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Consultando alertas tempranas...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No se encontraron alertas para los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Nivel de Riesgo</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Curso</th>
                  <th className="py-3 px-4">Causa Disparadora</th>
                  <th className="py-3 px-4">Inasistencia</th>
                  <th className="py-3 px-4">Acudiente</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <RiskBadge level={alert.level} score={alert.score} />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {alert.studentName}
                      <span className="block text-[11px] font-mono text-slate-400">
                        Doc: {alert.documentNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{alert.grade}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs leading-relaxed">
                      {alert.triggerReason}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">
                      {alert.attendanceAbsenceRate}%
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-semibold text-slate-800">{alert.guardianName}</p>
                      <p className="text-slate-500">{alert.guardianPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenCaseModal(alert)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-900 text-white font-semibold text-xs shadow hover:bg-brand-800 transition"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        Abrir Caso
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Abrir Caso de Acompañamiento */}
      {caseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Abrir Caso de Acompañamiento
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Estudiante: <span className="font-bold text-slate-800">{selectedAlertForCase?.studentName}</span> ({selectedAlertForCase?.grade})
            </p>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo de Apertura / Justificación del Caso
                </label>
                <textarea
                  required
                  rows={3}
                  value={openingReason}
                  onChange={(e) => setOpeningReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prioridad Institucional
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 shadow"
                >
                  Crear y Derivar a Acompañamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAlertsList;
