import React, { useState } from 'react';
import { alertasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export const WellnessSurvey = () => {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState(user?.id || '22222222-2222-2222-2222-222222222201');
  const [formData, setFormData] = useState({
    hasEconomicHardship: false,
    worksOrCaresFamily: false,
    transportationDifficulty: false,
    feelsAcademicSupportLacking: false,
    lowMotivationOrBelonging: false,
    experiencedConflictOrBullying: false,
    qualitativeFeedback: '',
    hasGuardianConsent: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await alertasApi.post('/surveys/responses', {
        studentId: studentId,
        ...formData
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error enviando encuesta:', err);
      alert('No se pudo enviar la encuesta. Verifique que el estudiante esté registrado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-emerald-200 shadow-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">
          ¡Gracias por compartir tus respuestas!
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Tus respuestas han sido recibidas con total confidencialidad. El equipo de docentes y orientación escolar de la IED Nueva Esperanza las utilizará para coordinar apoyos pedagógicos, bienestar y rutas de transporte según sea necesario.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              hasEconomicHardship: false,
              worksOrCaresFamily: false,
              transportationDifficulty: false,
              feelsAcademicSupportLacking: false,
              lowMotivationOrBelonging: false,
              experiencedConflictOrBullying: false,
              qualitativeFeedback: '',
              hasGuardianConsent: true
            });
          }}
          className="px-6 py-2.5 rounded-xl bg-brand-900 text-white font-bold text-xs shadow hover:bg-brand-800 transition"
        >
          Responder otra encuesta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Encuesta de Bienestar y Permanencia Escolar</h1>
        <p className="text-sm text-slate-500 mt-1">
          Instrumento anónimo y formativo para estudiantes de grados 8.º a 11.º · IED Nueva Esperanza
        </p>
      </div>

      {/* Caja de Confidencialidad y Consentimiento */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Espacio Seguro y Confidencial</p>
          <p className="leading-relaxed">
            Este cuestionario busca conocer los desafíos de transporte, economía o motivación que puedan afectar tu permanencia escolar. No afecta tus notas ni genera sanciones. Las respuestas guían planes de apoyo formativo.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            ID de Estudiante (Referencial para seguimiento)
          </label>
          <input
            type="text"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-brand-500"
            placeholder="UUID del estudiante"
          />
        </div>

        {/* Preguntas basadas en el Árbol de Problemas */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Dimensiones de Bienestar y Contexto
          </h3>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={formData.hasEconomicHardship}
              onChange={(e) => setFormData({ ...formData, hasEconomicHardship: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">1. Limitaciones económicas familiares</span>
              <span className="text-slate-500">
                ¿Tu familia ha presentado dificultades recientes para adquirir útiles, uniformes, alimentación o conectividad a internet?
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={formData.worksOrCaresFamily}
              onChange={(e) => setFormData({ ...formData, worksOrCaresFamily: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">2. Responsabilidades laborales o de cuidado en el hogar</span>
              <span className="text-slate-500">
                ¿Debes trabajar de manera informal o cuidar a hermanos menores/familiares enfermos, dificultando tu asistencia diaria?
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={formData.transportationDifficulty}
              onChange={(e) => setFormData({ ...formData, transportationDifficulty: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">3. Dificultades de transporte, distancia o inseguridad en trayectos</span>
              <span className="text-slate-500">
                ¿Vives en comunas alejadas (Cazucá, Compartir, etc.), el costo del transporte es alto o los traslados te resultan inseguros?
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={formData.feelsAcademicSupportLacking}
              onChange={(e) => setFormData({ ...formData, feelsAcademicSupportLacking: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">4. Acompañamiento académico y nivelación</span>
              <span className="text-slate-500">
                ¿Sientes que te quedas atrasado en alguna materia y requieres tutoría o nivelación adicional para no desanimarte?
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={formData.lowMotivationOrBelonging}
              onChange={(e) => setFormData({ ...formData, lowMotivationOrBelonging: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">5. Motivación y sentido de pertenencia</span>
              <span className="text-slate-500">
                ¿Has sentido desmotivación o desinterés frente a la continuidad de tus estudios secundarios?
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={formData.experiencedConflictOrBullying}
              onChange={(e) => setFormData({ ...formData, experiencedConflictOrBullying: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">6. Clima escolar y convivencia</span>
              <span className="text-slate-500">
                ¿Has vivido o presenciado situaciones de rechazo, acoso o conflicto que te hagan querer faltar a clases?
              </span>
            </div>
          </label>
        </div>

        {/* Pregunta Abierta Cualitativa */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Espacio abierto: ¿Qué apoyo adicional te gustaría recibir del colegio?
          </label>
          <textarea
            rows={3}
            value={formData.qualitativeFeedback}
            onChange={(e) => setFormData({ ...formData, qualitativeFeedback: e.target.value })}
            placeholder="Cuéntanos con tus palabras qué te ayudaría a asistir todos los días..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Checkbox de Consentimiento Informado */}
        <label className="flex items-center gap-2 pt-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={formData.hasGuardianConsent}
            onChange={(e) => setFormData({ ...formData, hasGuardianConsent: e.target.checked })}
            className="w-4 h-4 text-brand-900 rounded focus:ring-brand-500"
          />
          <span>Doy mi consentimiento para que estas respuestas sean usadas con fines de apoyo pedagógico institucional.</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-brand-900 text-white font-bold text-sm shadow-md hover:bg-brand-800 transition disabled:opacity-50"
        >
          {submitting ? 'Guardando respuesta y recalculando...' : 'Enviar Encuesta de Bienestar'}
        </button>
      </form>
    </div>
  );
};

export default WellnessSurvey;
