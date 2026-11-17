import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendanceRegister from './pages/AttendanceRegister';
import RiskAlertsList from './pages/RiskAlertsList';
import CaseManagement from './pages/CaseManagement';
import WellnessSurvey from './pages/WellnessSurvey';
import StudentProfile from './pages/StudentProfile';

// Authenticated main application shell layout
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected authenticated routes */}
            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Directivo', 'Orientador', 'Docente', 'Estudiante']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Docente']} />}>
              <Route path="/asistencia" element={<AttendanceRegister />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Orientador', 'Directivo', 'Docente']} />}>
              <Route path="/alertas" element={<RiskAlertsList />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Orientador', 'Directivo']} />}>
              <Route path="/casos" element={<CaseManagement />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Orientador', 'Estudiante']} />}>
              <Route path="/encuesta" element={<WellnessSurvey />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Orientador', 'Directivo', 'Docente']} />}>
              <Route path="/estudiantes" element={<StudentProfile />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
