import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  AlertTriangle,
  FolderHeart,
  ClipboardList,
  Users
} from 'lucide-react';

export const Sidebar = () => {
  const { user, hasRole } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Panel Institucional',
      icon: LayoutDashboard,
      roles: ['Administrador', 'Directivo', 'Orientador', 'Docente']
    },
    {
      to: '/asistencia',
      label: 'Toma de Asistencia',
      icon: CalendarCheck,
      roles: ['Administrador', 'Docente']
    },
    {
      to: '/alertas',
      label: 'Alertas de Riesgo',
      icon: AlertTriangle,
      roles: ['Administrador', 'Orientador', 'Directivo', 'Docente']
    },
    {
      to: '/casos',
      label: 'Casos y Planes',
      icon: FolderHeart,
      roles: ['Administrador', 'Orientador', 'Directivo']
    },
    {
      to: '/encuesta',
      label: 'Encuesta de Bienestar',
      icon: ClipboardList,
      roles: ['Administrador', 'Orientador', 'Estudiante']
    },
    {
      to: '/estudiantes',
      label: 'Directorio Estudiantes',
      icon: Users,
      roles: ['Administrador', 'Orientador', 'Directivo', 'Docente']
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between py-6 min-h-[calc(100vh-4rem)]">
      <nav className="px-4 space-y-1">
        <div className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navegación
        </div>
        {navItems
          .filter(item => hasRole(item.roles))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="px-6 py-4 mx-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Enfoque Formativo</p>
        <p className="mt-1 leading-relaxed">
          Las alertas son señales para acompañamiento humano, nunca para exclusión.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
