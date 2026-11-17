import React, { useEffect, useState } from 'react';
import { acompanamientoApi } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderHeart,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const res = await acompanamientoApi.get('/dashboard/indicators');
      setData(res.data);
    } catch (err) {
      console.error('Error cargando indicadores:', err);
      setError('No se pudo conectar con el microservicio de acompañamiento.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-semibold text-slate-500">Cargando panel institucional...</p>
        </div>
      </div>
    );
  }

  const { summary, casesByStatus, gradeBreakdown, ethicalNote } = data || {
    summary: {
      totalCases: 0,
      activeCases: 0,
      closedSuccessful: 0,
      planCompletionRate: 0,
      averageAlertToContactHours: 0
    },
    casesByStatus: {},
    gradeBreakdown: []
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Panel de Control Institucional</h1>
        <p className="text-sm text-slate-500 mt-1">
          Indicadores agregados de permanencia y acompañamiento escolar · IED Nueva Esperanza (Soacha)
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* Tarjetas de Indicadores Clave (KPIs obligatorios) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Casos Activos de Apoyo"
          value={summary.activeCases}
          subtitle={`De un total de ${summary.totalCases} casos registrados`}
          icon={FolderHeart}
          color="blue"
        />
        <StatCard
          title="Planes Completados"
          value={`${summary.planCompletionRate}%`}
          subtitle={`${summary.completedActions || 0} acciones ejecutadas con éxito`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Tiempo Alerta-Contacto"
          value={`${summary.averageAlertToContactHours}h`}
          subtitle="Promedio desde detección a comunicación con familia"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Casos Cerrados con Éxito"
          value={summary.closedSuccessful}
          subtitle="Estudiantes con permanencia asegurada"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Desglose de Permanencia por Grado (8.º a 11.º) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Distribución de Alertas y Casos por Curso
            </h2>
            <p className="text-xs text-slate-500">
              Grados 8.º a 11.º focalizados en el Árbol de Problemas
            </p>
          </div>
          <Link
            to="/alertas"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            Ver alertas detalladas <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {gradeBreakdown.map((item) => (
            <div
              key={item.grade}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-center hover:bg-white hover:border-brand-200 transition"
            >
              <p className="text-xs font-extrabold text-slate-700">{item.grade}</p>
              <p className="text-xl font-black text-brand-900 my-1">{item.totalCases}</p>
              <p className="text-[10px] text-slate-500">
                {item.highPriorityCases > 0 ? (
                  <span className="text-red-600 font-semibold">{item.highPriorityCases} alta</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">Bajo riesgo</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nota ética y marco de protección de datos */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-brand-800 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-brand-900 mb-0.5">Enfoque de Privacidad y No Estigmatización</p>
          <p>
            {ethicalNote || "El sistema genera señales para la orientación formativa y el diálogo con las familias. Ningún estudiante es etiquetado permanentemente ni excluido de las actividades escolares."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
