import React, { useState, useEffect } from 'react';
import { alertasApi } from '../services/api';
import { CalendarCheck, Save, Check, X, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';

export const AttendanceRegister = () => {
  const [courses] = useState(['8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B']);
  const [selectedCourse, setSelectedCourse] = useState('8-A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [justifications, setJustifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStudents(selectedCourse);
  }, [selectedCourse]);

  const fetchStudents = async (grade) => {
    try {
      setLoading(true);
      const res = await alertasApi.get(`/students?grade=${grade}`);
      setStudents(res.data);

      // Initialize attendance status as 'Presente' by default
      const initialMap = {};
      res.data.forEach((s) => {
        initialMap[s.id] = 'Presente';
      });
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error('Error al cargar lista de estudiantes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleJustificationChange = (studentId, text) => {
    setJustifications(prev => ({
      ...prev,
      [studentId]: text
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setMessage(null);

    try {
      let savedCount = 0;
      // Persist daily attendance record for each student
      for (const student of students) {
        const status = attendanceMap[student.id] || 'Presente';
        const reason = justifications[student.id] || null;

        await alertasApi.post('/attendance', {
          studentId: student.id,
          date: date,
          courseGrade: selectedCourse,
          status: status,
          justificationReason: reason
        });
        savedCount++;
      }

      setMessage({
        type: 'success',
        text: `Asistencia guardada exitosamente para ${savedCount} estudiantes del curso ${selectedCourse}. Se han recalculado los niveles de alerta preventiva.`
      });
    } catch (err) {
      console.error('Error guardando asistencias:', err);
      setMessage({
        type: 'error',
        text: 'Ocurrió un error al registrar la asistencia. Verifique su conexión.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Registro Diario de Asistencia</h1>
          <p className="text-sm text-slate-500 mt-1">
            Módulo docente · Reporte ágil de permanencia en el aula (IED Nueva Esperanza)
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-xl font-bold text-sm shadow hover:bg-brand-800 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando y Recalculando...' : 'Guardar Asistencia'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Curso / Grado
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Fecha de Clase
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Listado de Estudiantes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando lista de estudiantes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4 text-center">Estado de Asistencia</th>
                  <th className="py-3 px-4">Observación / Justificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, index) => {
                  const currentStatus = attendanceMap[student.id] || 'Presente';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{student.fullName}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">{student.documentNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Presente')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              currentStatus === 'Presente'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            P
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Ausente')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              currentStatus === 'Ausente'
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            A
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Tarde')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              currentStatus === 'Tarde'
                                ? 'bg-amber-500 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            T
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Justificada')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              currentStatus === 'Justificada'
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            J
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Motivo de falta o retardo..."
                          value={justifications[student.id] || ''}
                          onChange={(e) => handleJustificationChange(student.id, e.target.value)}
                          className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRegister;
