import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { notify } from '../../lib/notify';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Package, Users, DollarSign, TrendingUp, ChevronRight, Droplet, MapPin, Recycle } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';
import { Button } from '../../components/primitives/Button';

const StatCard = ({ title, value, subtext, icon, isPrimary = false }) => {
  const IconComponent = icon;
  return (
    <div
      className={`p-6 rounded-3xl shadow-sm border flex flex-col justify-between transition-transform hover:-translate-y-1 ${
        isPrimary
          ? 'bg-primary text-white border-primary shadow-primary/20'
          : 'bg-white border-primary-light/20'
      }`}
    >
      <div className="flex items-center space-x-3 mb-4 opacity-90">
        <div
          className={`p-2 rounded-xl ${
            isPrimary ? 'bg-white/20' : 'bg-primary/10 text-primary'
          }`}
        >
          <IconComponent size={24} />
        </div>
        <span className="text-sm md:text-base font-bold tracking-wide">
          {title}
        </span>
      </div>
      <div>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
          {value}
        </h3>
        {subtext && (
          <p
            className={`text-xs md:text-sm mt-2 font-semibold ${
              isPrimary ? 'text-primary-light' : 'text-secondary'
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    clientes_activos: 0,
    total_envases: 0,
    valor_envases_calle: 0,
    saldos_pendientes: 0,
    deuda_en_calle: 0,
    recaudacion_hoy: 0,
  });
  const [envasesPorTipo, setEnvasesPorTipo] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      dashboardService
        .getResumen()
        .then((data) => {
          setStats(data.kpis || data);
          setEnvasesPorTipo(data.envases_por_tipo || []);
        })
        .catch((error) => { console.error(error); notify.error(error, 'No se pudo cargar el resumen'); });
    }
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* Header */}
      <PageHeader
        title={`Buenos días, ${user?.full_name?.split(' ')[0] || 'Equipo'}`}
        subtitle={isAdmin ? 'Resumen operativo' : 'Tu recorrido de hoy'}
      />

      <div className="px-5 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* VISTA DE ADMIN */}
          {isAdmin ? (
            <>
              <StatCard
                title="Clientes Activos"
                value={stats.clientes_activos}
                icon={Users}
              />
              <StatCard
                title="Envases en Calle"
                value={stats.total_envases}
                subtext={
                  stats.valor_envases_calle > 0
                    ? `Capital: $${stats.valor_envases_calle.toLocaleString('es-AR')}`
                    : undefined
                }
                icon={Package}
              />
              <StatCard
                title="Recaudación Hoy"
                value={`$${stats.recaudacion_hoy}`}
                icon={DollarSign}
                isPrimary
              />
              <StatCard
                title="Deuda en Calle"
                value={`$${stats.saldos_pendientes || stats.deuda_en_calle || 0}`}
                icon={TrendingUp}
              />
            </>
          ) : (
            /* VISTA DE REPARTIDOR */
            <>
              <StatCard
                title="Recorridos"
                value="Mi Ruta"
                icon={MapPin}
                isPrimary
              />
              <StatCard title="Clientes" value="Ver Lista" icon={Users} />
            </>
          )}
        </div>

        {/* DESGLOSE DE ENVASES EN CALLE POR TIPO (MULTI-RUBRO) */}
        {isAdmin && envasesPorTipo.length > 0 && (
          <div className="mt-6 bg-white p-5 rounded-3xl border border-primary-light/25 shadow-sm">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
              <Recycle size={16} className="text-emerald-600" />
              Detalle de Envases Retornables en Calle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {envasesPorTipo.map((env) => (
                <div
                  key={env.tipo_envase_id}
                  className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-primary-dark text-sm truncate">
                      {env.nombre}
                    </p>
                    {env.valor_total > 0 && (
                      <p className="text-xs text-emerald-700 font-semibold">
                        ${env.valor_total.toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                  <span className="text-xl font-black text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200 shrink-0">
                    {env.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-primary-light/20">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              fullWidth
              rightIcon={<ChevronRight size={20} className="opacity-70" />}
              onClick={() => navigate('/recorridos')}
            >
              Iniciar Recorrido
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              rightIcon={<ChevronRight size={20} className="opacity-50" />}
              onClick={() => navigate('/clientes')}
            >
              Gestionar Clientes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};