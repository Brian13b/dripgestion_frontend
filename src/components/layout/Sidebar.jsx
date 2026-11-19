import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, MapPin, Tag, UserCircle, History, Settings, UserCog, LogOut, Droplets, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import clsx from 'clsx';
import { AuthContext } from '../../context/AuthContext';
import { TenantContext } from '../../context/TenantContext';

const SidebarItem = ({ to, icon, label, collapsed, matchPrefixes = [] }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    matchPrefixes.some((prefix) => location.pathname.startsWith(prefix));
  const IconComponent = icon;

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={clsx(
        'flex items-center rounded-2xl text-sm font-semibold transition-all duration-200',
        collapsed ? 'justify-center px-2 py-3' : 'gap-3.5 px-4 py-3',
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
          : 'text-slate-600 hover:bg-primary/10 hover:text-primary-dark'
      )}
    >
      <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};

const SectionLabel = ({ text, collapsed }) => {
  if (collapsed) {
    return <div className="my-3 mx-3 border-t border-slate-200/80" />;
  }

  return (
    <div className="pt-4 pb-1 px-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
        {text}
      </p>
    </div>
  );
};

export const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const { user, logout } = useContext(AuthContext);
  const { tenant } = useContext(TenantContext);
  const navigate = useNavigate();

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 bg-white shadow-sm transition-all duration-300',
        collapsed ? 'lg:w-20' : 'lg:w-64'
      )}
    >
      {/* Cabecera: Marca + Botón Colapsar */}
      <div className={clsx('bg-primary-dark h-32 border-b-4 border-primary shadow-md flex flex-col justify-between py-3 transition-all duration-300', collapsed ? 'items-center px-2' : 'px-4')}>
        <button type="button" onClick={onToggleCollapse} title={collapsed ? 'Expandir menú' : 'Colapsar menú'} aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className={clsx(
            'p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer',
            collapsed ? 'self-center' : 'self-end'
          )}
        >
          {collapsed ? (<PanelLeftOpen size={18} />) : ( <> <PanelLeftClose size={18} /> <span className="sr-only">Colapsar menú</span> </>)}
        </button>
        <div className={clsx('flex items-center min-w-0', collapsed ? 'justify-center' : 'gap-3')}>
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.nombre}
              className="w-10 h-10 rounded-xl object-cover border border-white/30 shrink-0 bg-white p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
              <Droplets size={22} />
            </div>
          )}

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate">
                {tenant?.nombre || 'Drip Gestión'}
              </p>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary-dark bg-primary-light px-2 py-0.5 rounded-md mt-0.5">
                {isAdmin ? 'Administrador' : 'Repartidor'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <SidebarItem to="/dashboard" icon={LayoutGrid} label="Inicio" collapsed={collapsed} />
        <SidebarItem to="/clientes" icon={Users} label="Clientes" collapsed={collapsed} />
        <SidebarItem to="/recorridos" icon={MapPin} label="Rutas y Repartos" collapsed={collapsed} matchPrefixes={['/recorridos', '/reparto']} />
        <SidebarItem to="/historial" icon={History} label="Historial del Día" collapsed={collapsed} />

        {isAdmin && (
          <>
            <SectionLabel text="Administración" collapsed={collapsed} />
            <SidebarItem to="/precios" icon={Tag} label="Productos y Envases" collapsed={collapsed} />
            <SidebarItem to="/equipo" icon={UserCog} label="Equipo" collapsed={collapsed} />
            <SidebarItem to="/configuracion" icon={Settings} label="Configuración" collapsed={collapsed} />
          </>
        )}

        <SectionLabel text="Cuenta" collapsed={collapsed} />
        <SidebarItem
          to="/perfil"
          icon={UserCircle}
          label="Portal Empresa"
          collapsed={collapsed}
          matchPrefixes={['/perfil', '/metricas']}
        />
      </nav>

      {/* Pie: Usuario actual + Cerrar sesión */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Cerrar Sesión' : undefined}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger hover:text-white transition active:scale-95 cursor-pointer',
            collapsed ? 'px-2' : 'px-4'
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};