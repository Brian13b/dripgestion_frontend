import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {LayoutGrid, Users, MapPin, Tag, UserCircle, History, Settings, UserCog, LogOut, Droplets } from 'lucide-react';
import clsx from 'clsx';
import { AuthContext } from '../../context/AuthContext';
import { TenantContext } from '../../context/TenantContext';

const SidebarItem = ({ to, icon, label, matchPrefixes = [] }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    matchPrefixes.some((prefix) => location.pathname.startsWith(prefix));
  const IconComponent = icon;

  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
          : 'text-slate-600 hover:bg-primary/10 hover:text-primary-dark'
      )}
    >
      <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { tenant } = useContext(TenantContext);
  const navigate = useNavigate();

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 bg-white shadow-sm">
      {/* Cabecera: Marca / Empresa */}
      <div className="bg-primary-dark px-5 py-6 border-b-4 border-primary flex items-center gap-3 shadow-md">
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
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">
            {tenant?.nombre || 'Drip Gestión'}
          </p>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary-dark bg-primary-light px-2 py-0.5 rounded-md mt-0.5">
            {isAdmin ? 'Administrador' : 'Repartidor'}
          </span>
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <SidebarItem to="/dashboard" icon={LayoutGrid} label="Inicio" />
        <SidebarItem to="/clientes" icon={Users} label="Clientes" />
        <SidebarItem
          to="/recorridos"
          icon={MapPin}
          label="Rutas y Repartos"
          matchPrefixes={['/recorridos', '/reparto']}
        />
        <SidebarItem to="/historial" icon={History} label="Historial del Día" />

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Administración
              </p>
            </div>
            <SidebarItem to="/precios" icon={Tag} label="Productos y Envases" />
            <SidebarItem to="/equipo" icon={UserCog} label="Equipo" />
            <SidebarItem to="/configuracion" icon={Settings} label="Configuración" />
          </>
        )}

        <div className="pt-4 pb-1 px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Cuenta
          </p>
        </div>
        <SidebarItem
          to="/perfil"
          icon={UserCircle}
          label="Portal Empresa"
          matchPrefixes={['/perfil', '/metricas']}
        />
      </nav>

      {/* Pie: Usuario actual + Cerrar sesión */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="mb-3 px-2">
          <p className="text-xs font-bold text-primary-dark truncate">
            {user?.full_name || user?.username}
          </p>
          <p className="text-[11px] text-slate-400 truncate">@{user?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger hover:text-white transition active:scale-95"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};