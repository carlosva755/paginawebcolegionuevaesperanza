import React, { useState, useEffect } from 'react';
import { alertasApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export const StudentProfile = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentDetail, setStudentDetail] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudentsList();
  }, []);

  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      const res = await alertasApi.get('/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedStudentId(res.data[0].id);
        loadStudentData(res.data[0].id);
      }
    } catch (err) {
      console.error('Error cargando lista de estudiantes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId) => {
    try {
      const [detailRes, attRes] = await Promise.all([
        alertasApi.get(`/students/${studentId}`),
        alertasApi.get(`/attendance/${studentId}`)
      ]);
      setStudentDetail(detailRes.data);
      setAttendanceHistory(attRes.data);
    } catch (err) {
      console.error('Error cargando historial de estudiante:', err);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.documentNumber.includes(search) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Directorio y Ficha del Estudiante</h1>
        <p className="text-sm text-slate-500 mt-1">
          Seguimiento formativo y garantía de derechos para estudiantes de secundaria (Soacha)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Buscador y Lista de Estudiantes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredStudents.map((s) => {
              const isSelected = selectedStudentId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStudentId(s.id);
                    loadStudentData(s.id);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? 'border-brand-900 bg-brand-50/70 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900">{s.fullName}</p>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white border text-slate-700">
                      {s.grade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>Doc: {s.documentNumber}</span>
                    <RiskBadge level={s.currentRiskLevel} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Detalle del Estudiante */}
        <div className="lg:col-span-2 space-y-6">
          {studentDetail ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Encabezado Ficha */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center font-bold text-lg">
                      {studentDetail.fullName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{studentDetail.fullName}</h2>
                      <p className="text-xs text-slate-500">
                        Documento: <strong className="text-slate-700">{studentDetail.documentNumber}</strong> · Grado: <strong className="text-slate-700">{studentDetail.grade}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <RiskBadge level={studentDetail.currentRiskLevel} score={studentDetail.riskScore} />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Último recálculo: {studentDetail.lastRiskCalculation ? new Date(studentDetail.lastRiskCalculation).toLocaleDateString() : 'Pendiente'}
                  </p>
                </div>
              </div>

              {/* AVISO ÉTICO OBLIGATORIO: No etiquetado permanente */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold mb-0.5">Nota Ética y de Intervención Humana (Obligatoria)</p>
                  <p>{studentDetail.ethicalNote}</p>
                </div>
              </div>

              {/* Información Familiar y de Ubicación en Soacha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 uppercase font-bold tracking-wider mb-1">Contacto del Acudiente</p>
                  <p className="font-bold text-slate-800 text-sm">{studentDetail.guardianName}</p>
                  <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {studentDetail.guardianPhone}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {studentDetail.guardianEmail || 'No registrado'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 uppercase font-bold tracking-wider mb-1">Residencia y Movilidad</p>
                  <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Barrio / Comuna: <strong>{studentDetail.neighborhood || 'Soacha Centro'}</strong>
                  </p>
                  <p className="text-slate-600 mt-1">Dirección: {studentDetail.address || 'Carrera 7 # 3-45'}</p>
                </div>
              </div>

              {/* Métricas de Asistencia Acumulada */}
              {attendanceHistory && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Balance de Asistencia (Último Mes)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-semibold">Total Clases</p>
                      <p className="text-lg font-black text-slate-800">{attendanceHistory.totalClases}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-[11px] text-emerald-700 font-semibold">Presentes</p>
                      <p className="text-lg font-black text-emerald-800">{attendanceHistory.totalPresentes}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-[11px] text-red-700 font-semibold">Ausencias</p>
                      <p className="text-lg font-black text-red-800">{attendanceHistory.totalAusentes}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-[11px] text-amber-700 font-semibold">% Inasistencia</p>
                      <p className="text-lg font-black text-amber-800">{attendanceHistory.absencePercentage}%</p>
                    </div>
                  </div>

                  {/* Tabla de Registros Recientes */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3">Observación Registrada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceHistory.records && attendanceHistory.records.slice(0, 8).map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-mono">{new Date(r.date).toLocaleDateString()}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                r.status === 'Presente' ? 'text-emerald-700 bg-emerald-50' :
                                r.status === 'Ausente' ? 'text-red-700 bg-red-50' :
                                r.status === 'Tarde' ? 'text-amber-700 bg-amber-50' :
                                'text-blue-700 bg-blue-50'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {r.justificationReason || 'Sin novedad'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Seleccione un estudiante para visualizar su ficha.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
