import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone, Package, DollarSign, Pencil, Trash2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientesService } from '../../api/clienteService';
import { productosService } from '../../api/productoService';
import { ClienteModal } from './ClienteModal';
import { CobroModal } from './CobroModal';

export const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [tiposEnvase, setTiposEnvase] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para búsqueda, filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 9; // Cantidad de clientes por página

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);

  const [cobroModalAbierto, setCobroModalAbierto] = useState(false);
  const [clienteParaCobrar, setClienteParaCobrar] = useState(null);

  // Efecto de Debounce para el buscador (espera 400ms después de que frena de escribir)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPaginaActual(1); // Volver a la primera página al buscar
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const [clientesData, envasesData] = await Promise.all([
        clientesService.getAll(),
        productosService.getTiposEnvase(false),
      ]);
      setClientes(clientesData);
      setTiposEnvase(envasesData);
    } catch (error) {
      console.error('Error al cargar datos', error);
      toast.error('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mapaEnvases = tiposEnvase.reduce((acc, env) => {
    acc[env.id] = env.nombre;
    return acc;
  }, {});

  // Filtrado de clientes según el texto buscado (con debounce)
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre_negocio.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.direccion.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Lógica de Paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / elementosPorPagina);
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro que querés eliminar a "${nombre}"?`)) {
      try {
        await clientesService.delete(id);
        setClientes(clientes.filter((cliente) => cliente.id !== id));
        toast.success('Cliente eliminado exitosamente');
      } catch (error) {
        toast.error('No se pudo eliminar el cliente');
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
    if (clienteEditandoId) {
      setClientes(
        clientes.map((c) => (c.id === clienteGuardado.id ? clienteGuardado : c))
      );
    } else {
      setClientes([clienteGuardado, ...clientes]);
    }
  };

  const renderEnvases = (cliente) => {
    if (cliente.envases_detalle?.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {cliente.envases_detalle.map((env) => (
            <span
              key={env.tipo_envase_id}
              className="bg-primary/10 border border-primary/20 text-primary-dark px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
            >
              {env.cantidad} {env.nombre}
            </span>
          ))}
        </div>
      );
    }

    const stock = cliente.stock_envases;
    if (!stock || Object.keys(stock).length === 0) {
      return <span className="text-secondary font-medium">Sin envases</span>;
    }

    const items = Object.entries(stock).filter(([, cant]) => Number(cant) > 0);
    if (items.length === 0) {
      return <span className="text-secondary font-medium">Sin envases</span>;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {items.map(([id, cant]) => (
          <span
            key={id}
            className="bg-primary/10 border border-primary/20 text-primary-dark px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
          >
            {cant} {mapaEnvases[id] || 'Envases'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* Header Limpio */}
      <div className="bg-primary-dark p-5 md:px-12 lg:px-16 pt-8 md:pt-10 text-white shadow-md border-b-4 border-primary">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center">
              <User size={32} className="mr-3 text-white" />
              Clientes
            </h1>
            <p className="text-primary-light font-medium mt-1 tracking-wider">
              Gestión y saldo de cuentas corrientes
            </p>
          </div>
          <button
            onClick={abrirModalNuevo}
            className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors p-3 md:px-6 rounded-2xl flex items-center shadow-sm font-bold text-lg cursor-pointer"
          >
            <Plus size={22} className="md:mr-2" />
            <span className="hidden md:inline tracking-wider">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros, Buscador y Conteo (Ubicada debajo del header) */}
      <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-16 mt-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Buscador con Delay (Debounce) */}
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-primary-light/30 focus:outline-none focus:border-primary bg-white text-primary-dark font-medium shadow-sm text-base transition-colors"
          />
        </div>

        {/* Cantidad de registros filtrados */}
        <div className="text-secondary font-bold text-sm bg-white px-5 py-3.5 rounded-2xl border border-primary-light/20 shadow-xs whitespace-nowrap">
          Mostrando <span className="text-primary-dark font-black">{clientesPaginados.length}</span> de <span className="text-primary-dark font-black">{clientesFiltrados.length}</span> registros
        </div>
      </div>

      {/* Listado de Clientes */}
      <div className="p-5 md:p-10 lg:px-16 max-w-7xl mx-auto pt-0">
        {loading ? (
          <p className="text-center text-secondary mt-10 text-xl tracking-wider animate-pulse">
            Cargando clientes...
          </p>
        ) : clientesPaginados.length === 0 ? (
          <p className="text-center text-secondary mt-10 text-xl tracking-wide">
            No se encontraron resultados para "{searchTerm}".
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {clientesPaginados.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-primary-light/20 relative hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="absolute top-5 right-5 flex space-x-2 text-gray-400">
                    <button
                      onClick={() => abrirCobro(cliente)}
                      className="text-success bg-success/10 p-2 rounded-xl hover:bg-success/20 transition-colors cursor-pointer"
                      title="Cobrar saldo"
                    >
                      <DollarSign size={20} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => abrirModalEditar(cliente.id)}
                      className="text-primary bg-primary/10 p-2 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id, cliente.nombre_negocio)}
                      className="text-danger bg-danger/10 p-2 rounded-xl hover:bg-danger/20 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <h3 className="font-bold text-primary-dark text-xl md:text-2xl mb-4 pr-32 tracking-tight leading-tight">
                    {cliente.nombre_negocio}
                  </h3>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-start text-secondary text-sm font-medium">
                      <MapPin size={18} className="mr-3 mt-0.5 shrink-0 text-primary" />
                      <span className="leading-snug">{cliente.direccion}</span>
                    </div>
                    {cliente.telefono && (
                      <div className="flex items-center text-secondary text-sm font-medium">
                        <Phone size={18} className="mr-3 shrink-0 text-primary" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="bg-background rounded-2xl p-4 flex flex-col gap-3 border border-primary-light/30">
                    <div className="flex items-center justify-between font-bold border-b border-primary-light/20 pb-3">
                      <span className="text-secondary flex items-center tracking-wide text-xs">
                        <DollarSign size={16} className="mr-1 text-primary" /> SALDO
                      </span>
                      <span
                        className={`text-lg ${
                          cliente.saldo_dinero > 0
                            ? 'text-danger'
                            : cliente.saldo_dinero < 0
                            ? 'text-success'
                            : 'text-primary-dark'
                        }`}
                      >
                        ${Math.abs(cliente.saldo_dinero)}{' '}
                        <span className="text-[10px] uppercase ml-1 opacity-70">
                          {cliente.saldo_dinero > 0
                            ? '(debe)'
                            : cliente.saldo_dinero < 0
                            ? '(a favor)'
                            : ''}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col font-bold">
                      <span className="text-secondary flex items-center tracking-wide mb-1 text-xs">
                        <Package size={16} className="mr-1 text-primary" /> ENVASES PRESTADOS
                      </span>
                      {renderEnvases(cliente)}
                    </div>
                  </div>

                  {cliente.observaciones && (
                    <p className="text-sm text-secondary mt-4 italic border-l-2 border-primary-light/50 pl-3">
                      "{cliente.observaciones}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPaginas > 1 && (
          <div className="flex items-center justify-center space-x-3 mt-10">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="p-3 rounded-2xl bg-white border border-primary-light/30 text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-primary-dark font-bold px-4 py-2 bg-white rounded-2xl border border-primary-light/30 shadow-xs">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="p-3 rounded-2xl bg-white border border-primary-light/30 text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clienteId={clienteEditandoId}
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