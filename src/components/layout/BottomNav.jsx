import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, MapPin, Tag, UserCircle } from 'lucide-react';
import clsx from 'clsx';
import { AuthContext } from '../../context/AuthContext';

const NavItem = ({ to, icon, label, matchPrefixes = [] }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    matchPrefixes.some((prefix) => location.pathname.startsWith(prefix));
  const IconComponent = icon;
  return (
    <Link
      to={to}
      className={clsx(
        'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200',
        isActive ? 'text-primary-dark font-bold scale-105' : 'text-secondary hover:text-primary'
      )}
    >
      <IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} className="md:w-6 md:h-6" />
      <span className="text-[10px] md:text-xs tracking-wide">{label}</span>
    </Link>
  );
};

export const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 z-50 w-full h-16 md:h-20 bg-white border-t border-primary-light/30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-safe">
      <div className="flex h-full w-full max-w-3xl mx-auto justify-around items-center px-2">
        <NavItem to="/dashboard" icon={LayoutGrid} label="Inicio" />
        <NavItem to="/clientes" icon={Users} label="Clientes" />
        <NavItem
          to="/recorridos"
          icon={MapPin}
          label="Rutas"
          matchPrefixes={['/recorridos', '/reparto']}
        />
        {isAdmin && <NavItem to="/precios" icon={Tag} label="Precios" />}
        <NavItem
          to="/perfil"
          icon={UserCircle}
          label="Portal"
          matchPrefixes={['/perfil', '/metricas', '/equipo', '/configuracion']}
        />
      </div>
    </div>
  );
};  