import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('orientador@nuevaesperanza.edu.co');
  const [password, setPassword] = useState('Orientador123*');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Error al iniciar sesión');
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Encabezado Institucional */}
        <div className="bg-brand-900 px-8 py-8 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <School className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">IED Nueva Esperanza</h2>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Municipio de Soacha · Plataforma de Alerta Temprana
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Correo Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="usuario@nuevaesperanza.edu.co"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-brand-900 text-white font-bold text-sm shadow-md hover:bg-brand-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Autenticando...' : 'Ingresar a la Plataforma'}
            </button>
          </form>

          {/* Accesos rápidos con credenciales de prueba */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Acceso Rápido por Rol (Demostración)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('orientador@nuevaesperanza.edu.co', 'Orientador123*')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition text-left"
              >
                <p className="font-bold text-slate-800">Orientador</p>
                <p className="text-[11px] text-slate-500">Gestión de alertas y casos</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('docente1@nuevaesperanza.edu.co', 'Docente123*')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <p className="font-bold text-slate-800">Docente</p>
                <p className="text-[11px] text-slate-500">Toma de asistencia</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('directivo@nuevaesperanza.edu.co', 'Directivo123*')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition text-left"
              >
                <p className="font-bold text-slate-800">Directivo</p>
                <p className="text-[11px] text-slate-500">Panel institucional KPIs</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('estudiante@nuevaesperanza.edu.co', 'Estudiante123*')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition text-left"
              >
                <p className="font-bold text-slate-800">Estudiante</p>
                <p className="text-[11px] text-slate-500">Encuesta de bienestar</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
