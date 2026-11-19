import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Clock, PackageOpen, Pencil, Plus, Truck } from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { PageContent } from '../../components/primitives/PageContent';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { LoadingState, EmptyState } from '../../components/primitives/StateBlock';
import { Button } from '../../components/primitives/Button';
import { AuthContext } from '../../context/AuthContext';
import { turnoService } from '../../api/turnoService';
import { recorridoService } from '../../api/recorridoService';
import { userService } from '../../api/userService';
import { notify } from '../../lib/notify';
import {
  DIAS_CORTOS, addDays, addMonths, formatear, hhmm, inicioDeMes, inicioDeSemana, mismoDia, toISO,
} from '../../lib/fechas';
import { TurnoModal } from './TurnoModal';

const VISTAS = [
  { value: 'mes', label: 'Mensual' },
  { value: 'semana', label: 'Semanal' },
  { value: 'dia', label: 'Diario' },
];

/** Rango que se pide al backend según la vista (el mes se muestra como 6 semanas completas). */
const rangoDe = (vista, ref) => {
  if (vista === 'dia') return [ref, ref];
  if (vista === 'semana') {
    const ini = inicioDeSemana(ref);
    return [ini, addDays(ini, 6)];
  }
  const ini = inicioDeSemana(inicioDeMes(ref));
  return [ini, addDays(ini, 41)];
};

const tituloDe = (vista, ref) => {
  if (vista === 'dia') return formatear(ref, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (vista === 'semana') {
    const [ini, fin] = rangoDe('semana', ref);
    return `${formatear(ini, { day: 'numeric', month: 'short' })} – ${formatear(fin, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return formatear(ref, { month: 'long', year: 'numeric' });
};

const Equipo = ({ repartidores }) => (
  <ul className="flex flex-wrap gap-1.5">
    {repartidores.map((r) => (
      <li
        key={r.user_id}
        className={clsx(
          'inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg',
          r.rol === 'conductor' ? 'bg-primary/10 text-primary' : 'bg-sand-100 text-secondary',
        )}
        title={r.rol === 'conductor' ? 'Conduce' : 'Ayuda a descargar'}
      >
        {r.rol === 'conductor' ? <Truck size={13} /> : <PackageOpen size={13} />}
        {r.nombre}
      </li>
    ))}
  </ul>
);

const TurnoCard = ({ turno, onEditar, mostrarFecha = false }) => (
  <article className="bg-white rounded-2xl border border-sand-100 shadow-sm p-4 space-y-2.5">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-bold text-primary">
          <Clock size={15} className="shrink-0" /> {hhmm(turno.hora_desde)} – {hhmm(turno.hora_hasta)}
        </p>
        <h3 className="font-bold text-primary-dark text-lg leading-tight truncate">{turno.recorrido_nombre}</h3>
        {mostrarFecha && (
          <p className="text-xs text-secondary font-semibold capitalize">{formatear(new Date(`${turno.fecha}T00:00:00`), { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        )}
      </div>
      {onEditar && (
        <Button variant="soft" size="sm" iconOnly aria-label="Editar turno" onClick={() => onEditar(turno)}>
          <Pencil size={16} />
        </Button>
      )}
    </div>
    <Equipo repartidores={turno.repartidores} />
    {turno.nota && <p className="text-sm text-secondary italic">“{turno.nota}”</p>}
  </article>
);

export const CalendarioView = () => {
  const { user } = useContext(AuthContext);
  const esAdmin = user?.role?.toLowerCase() === 'admin';

  const [vista, setVista] = useState('mes');
  const [ref, setRef] = useState(() => new Date());
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recorridos, setRecorridos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [filtroRuta, setFiltroRuta] = useState('');
  const [filtroRepartidor, setFiltroRepartidor] = useState('');
  const [modal, setModal] = useState(null); // { modo, turno?, fecha? }

  const [desde, hasta] = useMemo(() => rangoDe(vista, ref), [vista, ref]);
  const desdeISO = toISO(desde);
  const hastaISO = toISO(hasta);

  useEffect(() => {
    (async () => {
      try {
        setRecorridos(await recorridoService.getAll());
        if (esAdmin) {
          const equipo = await userService.getEquipo();
          setRepartidores(equipo.filter((u) => u.role?.toLowerCase() === 'repartidor' && u.is_active));
        }
      } catch (e) {
        notify.error(e, 'No se pudieron cargar las rutas');
      }
    })();
  }, [esAdmin]);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (filtroRuta) filtros.recorrido_id = filtroRuta;
      if (esAdmin && filtroRepartidor) filtros.repartidor_id = filtroRepartidor;
      setTurnos(await turnoService.listar(desdeISO, hastaISO, filtros));
    } catch (e) {
      notify.error(e, 'No se pudo cargar el calendario');
    } finally {
      setLoading(false);
    }
  }, [desdeISO, hastaISO, filtroRuta, filtroRepartidor, esAdmin]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const porDia = useMemo(() => {
    const mapa = {};
    turnos.forEach((t) => {
      (mapa[t.fecha] ||= []).push(t);
    });
    return mapa;
  }, [turnos]);

  const mover = (dir) => {
    if (vista === 'dia') setRef(addDays(ref, dir));
    else if (vista === 'semana') setRef(addDays(ref, 7 * dir));
    else setRef(addMonths(ref, dir));
  };

  const irADia = (d) => {
    setRef(d);
    setVista('dia');
  };

  const hoy = new Date();
  const puedeProgramar = esAdmin && recorridos.length > 0;
  const abrir = (modo, extra = {}) => {
    if (!recorridos.length) return notify.error('Primero creá una ruta en "Rutas y Repartos"');
    setModal({ modo, ...extra });
  };
  const editar = esAdmin ? (turno) => abrir('turno', { turno }) : undefined;

  /* ─── Vista mensual ─────────────────────────────────────────────────────── */
  const dias42 = Array.from({ length: 42 }, (_, i) => addDays(desde, i));
  const vistaMes = (
    <div className="bg-white rounded-3xl border border-sand-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 bg-sand-50 border-b border-sand-100">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-bold uppercase tracking-wider text-secondary">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias42.map((d) => {
          const lista = porDia[toISO(d)] || [];
          const fueraDelMes = d.getMonth() !== ref.getMonth();
          const esHoy = mismoDia(d, hoy);
          return (
            <button
              key={toISO(d)} type="button" onClick={() => irADia(d)}
              aria-label={`${formatear(d, { weekday: 'long', day: 'numeric', month: 'long' })}: ${lista.length} turnos`}
              className={clsx(
                'min-h-16 md:min-h-28 p-1.5 md:p-2 border-b border-r border-sand-100 text-left align-top cursor-pointer transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
                fueraDelMes && 'bg-sand-50/70 text-secondary/60',
              )}
            >
              <span className={clsx(
                'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs md:text-sm font-bold',
                esHoy ? 'bg-primary text-white' : fueraDelMes ? 'text-secondary/60' : 'text-primary-dark',
              )}>
                {d.getDate()}
              </span>
              {lista.length > 0 && (
                <>
                  <span className="md:hidden mt-1 flex justify-center">
                    <span className="h-5 min-w-5 px-1 rounded-full bg-primary/15 text-primary text-[11px] font-black inline-flex items-center justify-center">{lista.length}</span>
                  </span>
                  <ul className="hidden md:block mt-1 space-y-1">
                    {lista.slice(0, 3).map((t) => (
                      <li key={t.id} className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                        {hhmm(t.hora_desde)} {t.recorrido_nombre}
                      </li>
                    ))}
                    {lista.length > 3 && <li className="text-[11px] font-bold text-secondary px-1">+{lista.length - 3} más</li>}
                  </ul>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ─── Vista semanal ─────────────────────────────────────────────────────── */
  const vistaSemana = (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {Array.from({ length: 7 }, (_, i) => addDays(desde, i)).map((d) => {
        const lista = porDia[toISO(d)] || [];
        const esHoy = mismoDia(d, hoy);
        return (
          <section key={toISO(d)} className={clsx('rounded-2xl border p-2.5 space-y-2 md:min-h-48', esHoy ? 'border-primary bg-primary/5' : 'border-sand-100 bg-sand-50/60')}>
            <button type="button" onClick={() => irADia(d)} className="w-full text-left cursor-pointer group">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">{formatear(d, { weekday: 'short' })}</p>
              <p className={clsx('text-lg font-black group-hover:text-primary', esHoy ? 'text-primary' : 'text-primary-dark')}>{d.getDate()}</p>
            </button>
            {lista.length === 0 && <p className="text-xs text-secondary/70 font-medium">Sin salidas</p>}
            {lista.map((t) => <TurnoCard key={t.id} turno={t} onEditar={editar} />)}
          </section>
        );
      })}
    </div>
  );

  /* ─── Vista diaria ──────────────────────────────────────────────────────── */
  const listaDia = porDia[toISO(ref)] || [];
  const vistaDia = listaDia.length === 0 ? (
    <EmptyState
      icon={CalendarDays}
      title="No hay rutas ese día"
      description={esAdmin ? 'Agregá un turno para asignar ruta, horario y repartidores.' : 'No tenés salidas programadas.'}
      action={esAdmin && <Button variant="primary" onClick={() => abrir('turno', { fecha: toISO(ref) })}><Plus size={18} /> Agregar turno</Button>}
    />
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {listaDia.map((t) => <TurnoCard key={t.id} turno={t} onEditar={editar} />)}
      {esAdmin && (
        <Button variant="soft" size="lg" onClick={() => abrir('turno', { fecha: toISO(ref) })} className="lg:col-span-2">
          <Plus size={18} /> Agregar turno a este día
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <PageHeader
        title="Calendario"
        subtitle="Qué ruta sale, cuándo y con quién"
        actions={puedeProgramar && <HeaderAction icon={CalendarRange} label="Programar" onClick={() => abrir('programar', { fecha: toISO(ref) })} />}
      />

      <PageContent className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SegmentedControl options={VISTAS} value={vista} onChange={setVista} size="md" className="self-start" />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" iconOnly aria-label="Anterior" onClick={() => mover(-1)}><ChevronLeft size={20} /></Button>
            <Button variant="secondary" size="md" onClick={() => setRef(new Date())}>Hoy</Button>
            <Button variant="secondary" size="md" iconOnly aria-label="Siguiente" onClick={() => mover(1)}><ChevronRight size={20} /></Button>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-primary-dark capitalize tracking-tight">{tituloDe(vista, ref)}</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <select className="field sm:max-w-60 cursor-pointer" value={filtroRuta} onChange={(e) => setFiltroRuta(e.target.value)} aria-label="Filtrar por ruta">
            <option value="">Todas las rutas</option>
            {recorridos.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          {esAdmin && (
            <select className="field sm:max-w-60 cursor-pointer" value={filtroRepartidor} onChange={(e) => setFiltroRepartidor(e.target.value)} aria-label="Filtrar por repartidor">
              <option value="">Todos los repartidores</option>
              {repartidores.map((r) => <option key={r.id} value={r.id}>{r.full_name || r.username}</option>)}
            </select>
          )}
        </div>

        {loading && turnos.length === 0 ? (
          <LoadingState label="Cargando calendario..." />
        ) : (
          <div className={clsx('transition-opacity', loading && 'opacity-60')}>
            {vista === 'mes' && vistaMes}
            {vista === 'semana' && vistaSemana}
            {vista === 'dia' && vistaDia}
          </div>
        )}
      </PageContent>

      {modal && (
        <TurnoModal
          modo={modal.modo}
          turno={modal.turno || null}
          fechaInicial={modal.fecha}
          recorridos={recorridos}
          repartidores={repartidores}
          onClose={() => setModal(null)}
          onSaved={cargar}
        />
      )}
    </div>
  );
};
