import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext'
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import { ClientesList } from './features/clientes/ClientesList';
import { RecorridosList } from './features/logistica/RecorridosList';
import { RecorridoModal } from './features/logistica/RecorridoModal';
import { RepartoView } from './features/reparto/RepartoView'
import { ResumenReparto } from './features/reparto/ResumenReparto';
import { PreciosView } from './features/precios/PreciosView';
import { HistorialView } from './features/logistica/HistorialView';
import { PerfilEmpresa } from './features/perfil/PerfilEmpresa';
import { PortalClienteView } from './features/portal/PortalClienteView';
import { ConfiguracionView } from './features/perfil/ConfiguracionView';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { Toaster } from 'react-hot-toast';

const RequireEmpresa = ({ adminOnly = false }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  
  const role = user.role?.toLowerCase();
  if (role === 'cliente') return <Navigate to="/mi-portal" replace />;
  
  if (adminOnly && role === 'repartidor') return <Navigate to="/dashboard" replace />;
  
  return (
    <div className="min-h-screen bg-background text-primary-dark pb-20 md:pb-24 overflow-x-hidden">
      <Outlet />
      <BottomNav />
    </div>
  );
};

const RequireCliente = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toLowerCase() !== 'cliente') return <Navigate to="/dashboard" replace />;
  
  return (
    <div className="min-h-screen bg-slate-200 flex justify-center selection:bg-primary-light selection:text-primary-dark">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Ruta pública */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={user.role?.toLowerCase() === 'cliente' ? '/mi-portal' : '/dashboard'} />} 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas Privadas: EMPRESA */}
      <Route element={<RequireEmpresa />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/recorridos" element={<RecorridosList />} />
        <Route path="/recorridos/nuevo" element={<RecorridoModal />} />
        <Route path="/recorridos/editar/:id" element={<RecorridoModal />} />
        <Route path="/reparto/:id" element={<RepartoView />} />
        <Route path="/reparto/resumen" element={<ResumenReparto />} />
        <Route path="/precios" element={<PreciosView />} />
        <Route path="/historial" element={<HistorialView />} />
        <Route path="/perfil" element={<PerfilEmpresa />} />
        <Route path="/configuracion" element={<ConfiguracionView />} />
      </Route>

      <Route element={<RequireEmpresa adminOnly={true} />}>
        <Route path="/precios" element={<PreciosView />} />
        <Route path="/configuracion" element={<ConfiguracionView />} />
        <Route path="/recorridos/nuevo" element={<RecorridoModal />} />
        <Route path="/recorridos/editar/:id" element={<RecorridoModal />} />
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
          <Toaster position="top-center" reverseOrder={false} />
          <OfflineBanner />
          <AppRoutes />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;