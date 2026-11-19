import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import clsx from 'clsx';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import { ClientesList } from './features/clientes/ClientesList';
import { RecorridosList } from './features/logistica/RecorridosList';
import { RecorridoModal } from './features/logistica/RecorridoModal';
import { RepartoView } from './features/reparto/RepartoView';
import { ResumenReparto } from './features/reparto/ResumenReparto';
import { PreciosView } from './features/precios/PreciosView';
import { HistorialView } from './features/logistica/HistorialView';
import { CalendarioView } from './features/calendario/CalendarioView';
import { PerfilEmpresa } from './features/perfil/PerfilEmpresa';
import { PortalClienteView } from './features/portal/PortalClienteView';
import { ConfiguracionView } from './features/perfil/ConfiguracionView';
import { EquipoView } from './features/perfil/EquipoView';
import { MetricasView } from './features/perfil/MetricasView';
import SuperAdminDashboard from './features/superadmin/SuperAdminDashboard';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './components/primitives/ConfirmProvider';

const RequireSuperAdmin = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();
  if (role !== 'superadmin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

const RequireEmpresa = ({ adminOnly = false }) => {
  const { user } = useContext(AuthContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();
  if (role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (role === 'cliente') return <Navigate to="/mi-portal" replace />;

  if (adminOnly && role === 'repartidor') return <Navigate to="/dashboard" replace />;

  return (
    <div
      className={clsx(
        'min-h-screen bg-background text-primary-dark pb-20 lg:pb-8 overflow-x-hidden transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      )}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <main className="w-full min-h-screen">
        <div key={location.pathname} className="anim-page">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

const RequireCliente = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toLowerCase() !== 'cliente') return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-sand-200 flex justify-center selection:bg-primary-light selection:text-primary-dark">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

function AppRoutes() {

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={<Login />}
      />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas Privadas: SUPERADMIN (Dueño del SaaS) */}
      <Route element={<RequireSuperAdmin />}>
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
      </Route>

      {/* Rutas Privadas: EMPRESA */}
      <Route element={<RequireEmpresa />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/recorridos" element={<RecorridosList />} />
        <Route path="/calendario" element={<CalendarioView />} />
        <Route path="/reparto/:id" element={<RepartoView />} />
        <Route path="/reparto/resumen" element={<ResumenReparto />} />
        <Route path="/historial" element={<HistorialView />} />
        <Route path="/perfil" element={<PerfilEmpresa />} />
        <Route path="/metricas" element={<MetricasView />} />
      </Route>

      {/* Rutas Privadas: EMPRESA (Solo Administradores) */}
      <Route element={<RequireEmpresa adminOnly={true} />}>
        <Route path="/precios" element={<PreciosView />} />
        <Route path="/configuracion" element={<ConfiguracionView />} />
        <Route path="/recorridos/nuevo" element={<RecorridoModal />} />
        <Route path="/recorridos/editar/:id" element={<RecorridoModal />} />
        <Route path="/equipo" element={<EquipoView />} />
      </Route>

      {/* Rutas Privadas: CLIENTE */}
      <Route element={<RequireCliente />}>
        <Route path="/mi-portal" element={<PortalClienteView />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(28, 25, 23, 0.92)',
                color: '#fff',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: { duration: 2800, iconTheme: { primary: '#16a34a', secondary: '#fff' } },
              error: { duration: 5000, iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
          <ConfirmProvider>
            <OfflineBanner />
            <AppRoutes />
          </ConfirmProvider>
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;