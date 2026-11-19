import { useContext } from 'react';
import { PageHeader } from '../../components/primitives/PageHeader';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { Store, Clock, Tag, LogOut, ChevronRight, Settings, Users, Activity } from 'lucide-react';

const MenuItem = ({ icon: Icon, title, subtitle, onClick, danger }) => (
  <button onClick={onClick} className="w-full bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20 flex items-center justify-between hover:bg-background hover:border-primary transition-all active:scale-95 group">
    <div className="flex items-center space-x-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${danger ? 'bg-danger/10 text-danger' : 'bg-primary-light/30 text-primary'}`}>
        <Icon size={28} />
      </div>
      <div className="text-left">
        <p className={`font-bold text-xl tracking-wide ${danger ? 'text-danger' : 'text-primary-dark'}`}>{title}</p>
        {subtitle && <p className="text-sm text-secondary font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
    <ChevronRight size={24} className={`transition-transform group-hover:translate-x-1 ${danger ? 'text-danger/50' : 'text-primary/50'}`} />
  </button>
);

export const PerfilEmpresa = () => {
  const { user, logout } = useContext(AuthContext);
  const tenant = useTenant();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <PageHeader title="Portal Empresa" subtitle="Tu cuenta y accesos rápidos" maxWidth="max-w-4xl" />

      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-sand-50 rounded-2xl flex items-center justify-center border border-sand-100 overflow-hidden shrink-0">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <Store size={28} className="text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-primary-dark tracking-tight truncate">{user?.full_name || 'Mi Distribuidora'}</p>
            <p className="text-secondary font-medium truncate">{tenant?.nombre || 'Gestión Logística'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-5 md:p-8 space-y-8 mt-2">
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-bold text-secondary uppercase tracking-widest ml-4">Panel de Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MenuItem icon={Clock} title="Cierre Diario" subtitle="Historial de ventas y cobros" onClick={() => navigate('/historial')} />
            <MenuItem icon={Tag} title="Lista de Precios" subtitle="Configurar catálogo y valores" onClick={() => navigate('/precios')} />
            {user?.role?.toUpperCase() === 'ADMIN' && (
              <>
                <MenuItem icon={Settings} title="Configuración" subtitle="Empresa, logo y seguridad" onClick={() => navigate('/configuracion')} />
                <MenuItem icon={Activity} title="Métricas y Reportes" subtitle="Gráficos y estadísticas" onClick={() => navigate('/metricas')} />
                <MenuItem icon={Users} title="Mi Equipo" subtitle="Gestionar repartidores" onClick={() => navigate('/equipo')} />
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-primary-light/20">
          <h3 className="text-sm md:text-base font-bold text-secondary uppercase tracking-widest ml-4">Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MenuItem icon={LogOut} title="Cerrar Sesión" subtitle="Salir de la cuenta" danger onClick={handleLogout} />
          </div>
        </div>

        <div className="text-center pt-10 opacity-60">
          <p className="text-sm font-bold text-primary-dark tracking-widest uppercase">
            {tenant?.nombre || 'Gestion'} v1.4.2
          </p>
          <p className="text-xs text-secondary mt-1 font-medium">Sistema de Gestión de Distribución.</p>
        </div>
      </div>
    </div>
  );
};