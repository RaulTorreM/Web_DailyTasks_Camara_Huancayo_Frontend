import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../features/auth/LoginPage';

// Cada pantalla se descarga solo cuando se visita: la primera carga es más liviana.
const InicioPage = lazy(() => import('../features/dailytasks/inicio/InicioPage'));
const ListaPage = lazy(() => import('../features/dailytasks/lista/ListaPage'));
const TableroPage = lazy(() => import('../features/dailytasks/tablero/TableroPage'));
const CalendarioPage = lazy(() => import('../features/dailytasks/calendario/CalendarioPage'));
const InformesPage = lazy(() => import('../features/dailytasks/informes/InformesPage'));
const ConfiguracionPage = lazy(() => import('../features/dailytasks/configuracion/ConfiguracionPage'));
const PapeleraPage = lazy(() => import('../features/dailytasks/papelera/PapeleraPage'));
const AuditoriaPage = lazy(() => import('../features/dailytasks/auditoria/AuditoriaPage'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InicioPage />} />
        <Route path="lista" element={<ListaPage />} />
        <Route path="tablero" element={<TableroPage />} />
        <Route path="calendario" element={<CalendarioPage />} />
        <Route path="informes" element={<InformesPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
        <Route path="auditoria" element={<AuditoriaPage />} />
        <Route path="papelera" element={<PapeleraPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
