import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { PageContent } from '../../components/primitives/PageContent';
import { LoadingState, EmptyState } from '../../components/primitives/StateBlock';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { useConfirm } from '../../components/primitives/ConfirmContext';
import { Button } from '../../components/primitives/Button';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Search, Plus, MapPin, Phone, DollarSign, Pencil, Trash2, User, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import { notify } from '../../lib/notify';
import { clientesService } from '../../api/clienteService';
import { productosService } from '../../api/productoService';
import { recorridoService } from '../../api/recorridoService';
import { userService } from '../../api/userService';
import { AuthContext } from '../../context/AuthContext';
import { ClienteModal } from './ClienteModal';
import { CobroModal } from './CobroModal';

const POR_PAGINA = 25;
const SIN = '__sin__'; // valor del filtro: "sin zona" / "sin repartidor"

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'deuda', label: 'Con deuda' },
  { value: 'aldia', label: 'Al día' },
  { value: 'favor', label: 'A favor' },
  { value: 'envases', label: 'Con envases' },
];

const ORDENES = [
  { value: 'nombre', label: 'Orden: nombre' },
  { value: 'deuda', label: 'Orden: mayor deuda' },
  { value: 'zona', label: 'Orden: zona' },
];

const normalizar = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const dinero = (n) => `$${Math.abs(Number(n) || 0).toLocaleString('es-AR')}`;

export const ClientesList = () => {
  const confirm = useConfirm();
  const { user } = useContext(AuthContext);
  const esAdmin = user?.role?.toLowerCase() === 'admin';

  const [clientes, setClientes] = useState([]);
  const [tiposEnvase, setTiposEnvase] = useState([]);
  const [recorridos, setRecorridos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estado, setEstado] = useState('todos');
  const [zona, setZona] = useState('');
  const [repartidor, setRepartidor] = useState('');
  const [orden, setOrden] = useState('nombre');
  const [paginaActual, setPaginaActual] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [cobroModalAbierto, setCobroModalAbierto] = useState(false);
  const [clienteParaCobrar, setClienteParaCobrar] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cualquier cambio de filtro vuelve a la primera página.
  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedSearch, estado, zona, repartidor, orden]);

  const fetchData = async () => {
    try {
      const [clientesData, envasesData, recorridosData] = await Promise.all([
        clientesService.getAll(),
        productosService.getTiposEnvase(false),
        recorridoService.getAll(),
      ]);
      setClientes(clientesData);
      setTiposEnvase(envasesData);
      setRecorridos(recorridosData);
      if (esAdmin) {
        const equipo = await userService.getEquipo();
        setRepartidores(equipo.filter((u) => u.role?.toLowerCase() === 'repartidor'));
      }
    } catch (error) {
      console.error('Error al cargar datos', error);
      notify.error(error, 'Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapaEnvases = useMemo(
    () => Object.fromEntries(tiposEnvase.map((e) => [String(e.id), e.nombre])),
    [tiposEnvase],
  );

  // cliente -> repartidores habituales de las rutas donde está
  const repartidoresPorCliente = useMemo(() => {
    const mapa = {};
    recorridos.forEach((r) => {
      (r.clientes_orden || []).forEach((cid) => {
        (mapa[cid] ||= new Set()).add(r.repartidor_id ?? SIN);
      });
    });
    return mapa;
  }, [recorridos]);

  const zonas = useMemo(
    () => [...new Set(clientes.map((c) => c.zona).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [clientes],
  );

  const envasesDe = (c) => {
    if (c.envases_detalle?.length > 0) {
      return c.envases_detalle.map((e) => ({ key: e.tipo_envase_id, cantidad: e.cantidad, nombre: e.nombre }));
    }
    return Object.entries(c.stock_envases || {})
      .filter(([, cant]) => Number(cant) > 0)
      .map(([id, cant]) => ({ key: id, cantidad: cant, nombre: mapaEnvases[id] || 'Envases' }));
  };

  const cumpleEstado = (c, e) => {
    if (e === 'deuda') return c.saldo_dinero > 0;
    if (e === 'aldia') return c.saldo_dinero === 0;
    if (e === 'favor') return c.saldo_dinero < 0;
    if (e === 'envases') return envasesDe(c).length > 0;
    return true;
  };

  const clientesFiltrados = useMemo(() => {
    const q = normalizar(debouncedSearch);
    const lista = clientes.filter((c) => {
      if (q && !normalizar(`${c.nombre_negocio} ${c.direccion} ${c.telefono ?? ''} ${c.zona ?? ''}`).includes(q)) return false;
      if (!cumpleEstado(c, estado)) return false;
      if (zona === SIN ? c.zona : zona && c.zona !== zona) return false;
      if (repartidor) {
        const reps = repartidoresPorCliente[c.id];
        if (repartidor === SIN ? reps && !(reps.size === 1 && reps.has(SIN)) : !reps?.has(Number(repartidor))) return false;
      }
      return true;
    });
    const porNombre = (a, b) => a.nombre_negocio.localeCompare(b.nombre_negocio, 'es');
    if (orden === 'deuda') lista.sort((a, b) => b.saldo_dinero - a.saldo_dinero || porNombre(a, b));
    else if (orden === 'zona') lista.sort((a, b) => (a.zona || '￿').localeCompare(b.zona || '￿', 'es') || porNombre(a, b));
    else lista.sort(porNombre);
    return lista;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes, debouncedSearch, estado, zona, repartidor, orden, repartidoresPorCliente, mapaEnvases]);

  const conteos = useMemo(
    () => Object.fromEntries(ESTADOS.map((e) => [e.value, clientes.filter((c) => cumpleEstado(c, e.value)).length])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientes, mapaEnvases],
  );

  const deudaFiltrada = clientesFiltrados.reduce((acc, c) => acc + Math.max(0, c.saldo_dinero || 0), 0);
  const hayFiltros = Boolean(debouncedSearch || estado !== 'todos' || zona || repartidor);
  const limpiarFiltros = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setEstado('todos');
    setZona('');
    setRepartidor('');
  };

  const totalPaginas = Math.ceil(clientesFiltrados.length / POR_PAGINA);
  const pagina = Math.min(paginaActual, Math.max(totalPaginas, 1));
  const clientesPaginados = clientesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const handleDelete = async (id, nombre) => {
    if (await confirm({ title: 'Eliminar cliente', message: `Vas a eliminar a "${nombre}". No se puede deshacer.`, confirmLabel: 'Eliminar' })) {
      try {
        await clientesService.delete(id);
        setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
        notify.success('Cliente eliminado exitosamente');
      } catch (error) {
        notify.error(error, 'No se pudo eliminar el cliente');
        console.error('Error al eliminar cliente', error);
      }
    }
  };

  const abrirModalNuevo = () => {
    setClienteEditandoId(null);
    setIsModalOpen(true);
  };
  const abrirModalEditar = (id) => {
    setClienteEditandoId(id);
    setIsModalOpen(true);
  };
  const abrirCobro = (cliente) => {
    setClienteParaCobrar(cliente);
    setCobroModalAbierto(true);
  };

  const handleGuardadoExitoso = (clienteGuardado) => {
    setClientes((prev) =>
      clienteEditandoId
        ? prev.map((c) => (c.id === clienteGuardado.id ? clienteGuardado : c))
        : [clienteGuardado, ...prev],
    );
  };

  const Saldo = ({ valor }) => (
    <span className={`font-black ${valor > 0 ? 'text-danger' : valor < 0 ? 'text-success' : 'text-primary-dark'}`}>
      {dinero(valor)}
      <span className="ml-1 text-[10px] font-bold uppercase opacity-70">{valor > 0 ? 'debe' : valor < 0 ? 'a favor' : ''}</span>
    </span>
  );

  const Acciones = ({ cliente }) => (
    <div className="flex items-center gap-1.5 shrink-0">
      <Button onClick={() => abrirCobro(cliente)} variant="successSoft" size="sm" iconOnly title="Cobrar saldo" aria-label={`Cobrar a ${cliente.nombre_negocio}`}>
        <DollarSign size={18} strokeWidth={3} />
      </Button>
      <Button onClick={() => abrirModalEditar(cliente.id)} variant="soft" size="sm" iconOnly title="Editar" aria-label={`Editar a ${cliente.nombre_negocio}`}>
        <Pencil size={18} />
      </Button>
      <Button onClick={() => handleDelete(cliente.id, cliente.nombre_negocio)} variant="dangerSoft" size="sm" iconOnly title="Eliminar" aria-label={`Eliminar a ${cliente.nombre_negocio}`}>
        <Trash2 size={18} />
      </Button>
    </div>
  );

  const Envases = ({ cliente }) => {
    const items = envasesDe(cliente);
    if (items.length === 0) return <span className="text-xs text-secondary/70 font-medium">Sin envases</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((e) => (
          <span key={e.key} className="bg-primary/10 text-primary-dark px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap">
            {e.cantidad} {e.nombre}
          </span>
        ))}
      </div>
    );
  };

  const COLUMNAS = 'md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto]';

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <PageHeader
        title="Clientes"
        subtitle="Cuentas corrientes y saldos"
        actions={<HeaderAction icon={Plus} label="Nuevo Cliente" onClick={abrirModalNuevo} />}
      />

      {/* Filtros */}
      <PageContent className="space-y-3">
        <div className="relative w-full">
          <Search size={20} className="absolute inset-y-0 left-4 my-auto text-secondary pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por nombre, dirección, teléfono o zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-12 pr-4"
            aria-label="Buscar clientes"
          />
        </div>

        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <SegmentedControl
            size="sm"
            value={estado}
            onChange={setEstado}
            options={ESTADOS.map((e) => ({ value: e.value, label: `${e.label} · ${conteos[e.value] ?? 0}` }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <select className="field cursor-pointer" value={zona} onChange={(e) => setZona(e.target.value)} aria-label="Filtrar por zona">
            <option value="">Todas las zonas</option>
            {zonas.map((z) => <option key={z} value={z}>{z}</option>)}
            <option value={SIN}>Sin zona</option>
          </select>
          {esAdmin ? (
            <select className="field cursor-pointer" value={repartidor} onChange={(e) => setRepartidor(e.target.value)} aria-label="Filtrar por repartidor">
              <option value="">Todos los repartidores</option>
              {repartidores.map((r) => <option key={r.id} value={r.id}>{r.full_name || r.username}</option>)}
              <option value={SIN}>Sin repartidor / sin ruta</option>
            </select>
          ) : <div className="hidden lg:block" />}
          <select className="field cursor-pointer" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
            {ORDENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="secondary" size="md" onClick={limpiarFiltros} disabled={!hayFiltros} className="h-11">
            <FilterX size={18} /> Limpiar filtros
          </Button>
        </div>

        <p className="text-sm font-semibold text-secondary" aria-live="polite">
          <span className="text-primary-dark font-black">{clientesFiltrados.length}</span> de {clientes.length} clientes
          {clientesFiltrados.length > 0 && deudaFiltrada > 0 && (
            <> · deuda <span className="text-danger font-black">{dinero(deudaFiltrada)}</span></>
          )}
        </p>
      </PageContent>

      {/* Lista compacta */}
      <PageContent top={false}>
        {loading ? (
          <LoadingState label="Cargando clientes..." />
        ) : clientesPaginados.length === 0 ? (
          <EmptyState
            icon={User}
            title={hayFiltros ? 'Sin resultados' : 'Todavía no hay clientes'}
            description={hayFiltros ? 'Ningún cliente coincide con los filtros elegidos.' : 'Cargá el primero con el botón "Nuevo Cliente".'}
            action={hayFiltros && <Button variant="soft" onClick={limpiarFiltros}><FilterX size={18} /> Limpiar filtros</Button>}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-sand-100 shadow-sm overflow-hidden">
            <div className={`hidden md:grid ${COLUMNAS} gap-4 px-5 py-2.5 bg-sand-50 border-b border-sand-100 text-xs font-bold uppercase tracking-wider text-secondary`}>
              <span>Cliente</span>
              <span className="text-right">Saldo</span>
              <span>Envases</span>
              <span className="w-[120px]" />
            </div>
            <ul className="divide-y divide-sand-100">
              {clientesPaginados.map((cliente) => (
                <li key={cliente.id} className={`grid grid-cols-[minmax(0,1fr)_auto] ${COLUMNAS} gap-x-4 gap-y-1.5 items-center px-4 md:px-5 py-3 hover:bg-sand-50/70 transition-colors`}>
                  <div className="min-w-0">
                    <p className="font-bold text-primary-dark leading-tight truncate">{cliente.nombre_negocio}</p>
                    <p className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-secondary font-medium mt-0.5">
                      <span className="inline-flex items-center gap-1 min-w-0"><MapPin size={12} className="text-primary shrink-0" /><span className="truncate">{cliente.direccion}</span></span>
                      {cliente.telefono && <span className="inline-flex items-center gap-1"><Phone size={12} className="text-primary shrink-0" />{cliente.telefono}</span>}
                      {cliente.zona && <span className="bg-sand-100 text-primary-dark font-bold px-1.5 py-0.5 rounded-md">{cliente.zona}</span>}
                    </p>
                  </div>
                  <div className="row-start-1 col-start-2 md:row-auto md:col-auto text-right text-sm md:text-base">
                    <Saldo valor={cliente.saldo_dinero} />
                  </div>
                  <div className="col-span-2 md:col-span-1 min-w-0"><Envases cliente={cliente} /></div>
                  <div className="col-span-2 md:col-span-1 flex md:justify-end"><Acciones cliente={cliente} /></div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button onClick={() => setPaginaActual(Math.max(pagina - 1, 1))} disabled={pagina === 1} variant="secondary" size="md" iconOnly aria-label="Página anterior">
              <ChevronLeft size={20} />
            </Button>
            <span className="text-primary-dark font-bold px-4 py-2 bg-white rounded-2xl border border-primary-light/30 shadow-xs">
              Página {pagina} de {totalPaginas}
            </span>
            <Button onClick={() => setPaginaActual(Math.min(pagina + 1, totalPaginas))} disabled={pagina === totalPaginas} variant="secondary" size="md" iconOnly aria-label="Página siguiente">
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </PageContent>

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clienteId={clienteEditandoId}
        zonasSugeridas={zonas}
        onSuccess={handleGuardadoExitoso}
      />
      <CobroModal
        isOpen={cobroModalAbierto}
        onClose={() => setCobroModalAbierto(false)}
        cliente={clienteParaCobrar}
        onSuccess={fetchData}
      />
    </div>
  );
};
