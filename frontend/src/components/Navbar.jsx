import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, School } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Orientador': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Docente': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Directivo': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center font-bold shadow-sm">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              IED Nueva Esperanza
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Soacha · Sistema de Alerta Temprana y Acompañamiento
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition border border-slate-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
