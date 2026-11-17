import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Cargando plataforma...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-12 bg-white rounded-2xl border border-red-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-slate-600 mb-6">
          Su rol actual no posee los permisos requeridos para visualizar esta sección.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-sm font-semibold shadow hover:bg-brand-800 transition"
        >
          Volver al Inicio
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
