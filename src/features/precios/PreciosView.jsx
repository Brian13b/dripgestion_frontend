import { useState, useEffect } from 'react';
import { Tag, Save, Package, Plus, X, Eye, EyeOff, Recycle, Box, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { productosService } from '../../api/productoService';

const UNIDADES_MEDIDA = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'caja', label: 'Caja' },
  { value: 'cajon', label: 'Cajón' },
  { value: 'pack', label: 'Pack' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'litro', label: 'Litro (L)' },
];

export const PreciosView = () => {
  const [tabActiva, setTabActiva] = useState('productos');

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [mostrandoFormProducto, setMostrandoFormProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    codigo: '',
    precio_actual: '',
    unidad_medida: 'unidad',
    es_retornable: false,
    tipo_envase_id: '',
  });

  const [tiposEnvase, setTiposEnvase] = useState([]);
  const [mostrandoFormEnvase, setMostrandoFormEnvase] = useState(false);
  const [editandoEnvaseId, setEditandoEnvaseId] = useState(null);
  const [nuevoValorReposicion, setNuevoValorReposicion] = useState('');
  const [nuevoEnvase, setNuevoEnvase] = useState({
    nombre: '',
    codigo: '',
    valor_reposicion: '',
  });

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [prodsData, envasesData] = await Promise.all([
        productosService.getAll(),
        productosService.getTiposEnvase(false),
      ]);
      setProductos(prodsData);
      setTiposEnvase(envasesData);
    } catch (error) {
      toast.error('Error al cargar el catálogo');
      console.error('Error al cargar catálogo y envases', error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS PRODUCTOS ---
  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id);
    setNuevoPrecio(producto.precio_actual.toString());
  };

  const guardarPrecio = async (id) => {
    try {
      await productosService.updatePrecio(id, nuevoPrecio);
      toast.success('Precio actualizado');
      setEditandoId(null);
      cargarTodo();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar');
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (nuevoProducto.es_retornable && !nuevoProducto.tipo_envase_id) {
      toast.error('Seleccioná el tipo de envase retornable');
      return;
    }

    try {
      await productosService.create({
        nombre: nuevoProducto.nombre.trim(),
        codigo: nuevoProducto.codigo.toUpperCase().replace(/\s+/g, '_'),
        precio_actual: parseFloat(nuevoProducto.precio_actual),
        unidad_medida: nuevoProducto.unidad_medida,
        es_retornable: nuevoProducto.es_retornable,
        tipo_envase_id: nuevoProducto.es_retornable
          ? parseInt(nuevoProducto.tipo_envase_id, 10)
          : null,
        activo: true,
      });
      toast.success('Producto agregado al catálogo');
      setMostrandoFormProducto(false);
      setNuevoProducto({
        nombre: '',
        codigo: '',
        precio_actual: '',
        unidad_medida: 'unidad',
        es_retornable: false,
        tipo_envase_id: '',
      });
      cargarTodo();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear producto');
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await productosService.toggleActivo(id);
      cargarTodo();
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al cambiar estado');
      console.error(error);
    }
  };

  // --- HANDLERS TIPOS DE ENVASE ---
  const handleCrearEnvase = async (e) => {
    e.preventDefault();
    try {
      await productosService.createTipoEnvase({
        nombre: nuevoEnvase.nombre.trim(),
        codigo: nuevoEnvase.codigo.toUpperCase().replace(/\s+/g, '_'),
        valor_reposicion: parseFloat(nuevoEnvase.valor_reposicion || 0),
        activo: true,
      });
      toast.success('Tipo de envase creado');
      setMostrandoFormEnvase(false);
      setNuevoEnvase({ nombre: '', codigo: '', valor_reposicion: '' });
      cargarTodo();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear tipo de envase');
    }
  };

  const guardarValorReposicion = async (id) => {
    try {
      await productosService.updateTipoEnvase(id, {
        valor_reposicion: parseFloat(nuevoValorReposicion || 0),
      });
      toast.success('Valor de reposición actualizado');
      setEditandoEnvaseId(null);
      cargarTodo();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar envase');
    }
  };

  const handleToggleEnvase = async (id) => {
    try {
      await productosService.toggleTipoEnvase(id);
      cargarTodo();
      toast.success('Estado del envase actualizado');
    } catch (error) {
      toast.error('Error al cambiar estado del envase');
      console.error(error);
    }
  };

  const envasesActivos = tiposEnvase.filter((e) => e.activo);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-primary-dark p-5 md:px-12 lg:px-16 pt-8 md:pt-10 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center">
              <Tag size={28} className="mr-3 text-white" />
              Catálogo y Envases
            </h1>
            <p className="text-primary-light text-xs md:text-sm font-medium mt-1 tracking-wider">
              Precios, presentaciones y control de retornables
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {tabActiva === 'productos' ? (
              <button
                onClick={() => setMostrandoFormProducto(!mostrandoFormProducto)}
                className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors px-4 py-2.5 md:px-5 rounded-2xl flex items-center shadow-sm font-bold text-sm md:text-base"
              >
                {mostrandoFormProducto ? (
                  <X size={20} />
                ) : (
                  <>
                    <Plus size={20} className="mr-1.5" />
                    <span>Nuevo Producto</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setMostrandoFormEnvase(!mostrandoFormEnvase)}
                className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors px-4 py-2.5 md:px-5 rounded-2xl flex items-center shadow-sm font-bold text-sm md:text-base"
              >
                {mostrandoFormEnvase ? (
                  <X size={20} />
                ) : (
                  <>
                    <Plus size={20} className="mr-1.5" />
                    <span>Nuevo Envase</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="max-w-7xl mx-auto mt-5 flex gap-2">
          <button
            onClick={() => setTabActiva('productos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              tabActiva === 'productos'
                ? 'bg-white text-primary-dark shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Package size={16} />
            Productos ({productos.length})
          </button>
          <button
            onClick={() => setTabActiva('envases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              tabActiva === 'envases'
                ? 'bg-white text-primary-dark shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Recycle size={16} />
            Envases Retornables ({tiposEnvase.length})
          </button>
        </div>
      </div>

      <div className="p-5 md:p-10 lg:px-16 max-w-7xl mx-auto mt-2">
        {loading ? (
          <p className="text-center text-secondary text-lg tracking-wider mt-10">
            Cargando catálogo...
          </p>
        ) : tabActiva === 'productos' ? (
          <>
            {/* FORMULARIO NUEVO PRODUCTO */}
            {mostrandoFormProducto && (
              <form
                onSubmit={handleCrearProducto}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-md border-2 border-primary/20 mb-8 max-w-4xl mx-auto"
              >
                <h3 className="font-bold text-primary-dark text-xl mb-5 tracking-wide border-b border-primary-light/30 pb-3">
                  Agregar Producto al Catálogo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
                      Nombre / Descripción
                    </label>
                    <input
                      required
                      type="text"
                      value={nuevoProducto.nombre}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          nombre: e.target.value,
                          codigo: e.target.value,
                        })
                      }
                      className="w-full border-2 border-primary-light/30 rounded-2xl p-3.5 bg-slate-50 text-base font-medium focus:border-primary focus:outline-none"
                      placeholder="Ej: Bidón 20L / Cajón Cerveza 1L"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
                      Precio de Venta ($)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={nuevoProducto.precio_actual}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          precio_actual: e.target.value,
                        })
                      }
                      className="w-full border-2 border-primary-light/30 rounded-2xl p-3.5 bg-slate-50 font-black text-primary text-lg focus:border-primary focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
                      Unidad de Medida
                    </label>
                    <select
                      value={nuevoProducto.unidad_medida}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          unidad_medida: e.target.value,
                        })
                      }
                      className="w-full border-2 border-primary-light/30 rounded-2xl p-3.5 bg-slate-50 text-base font-semibold text-primary-dark focus:border-primary focus:outline-none"
                    >
                      {UNIDADES_MEDIDA.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl border-2 border-primary-light/30 bg-slate-50 hover:border-primary transition">
                      <input
                        type="checkbox"
                        checked={nuevoProducto.es_retornable}
                        onChange={(e) =>
                          setNuevoProducto({
                            ...nuevoProducto,
                            es_retornable: e.target.checked,
                            tipo_envase_id: e.target.checked
                              ? nuevoProducto.tipo_envase_id
                              : '',
                          })
                        }
                        className="w-5 h-5 accent-primary rounded"
                      />
                      <div>
                        <span className="font-bold text-sm text-primary-dark block">
                          ¿Lleva envase retornable?
                        </span>
                        <span className="text-xs text-slate-500">
                          Controla saldo de envases prestados al cliente
                        </span>
                      </div>
                    </label>
                  </div>

                  {nuevoProducto.es_retornable && (
                    <div className="md:col-span-2 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                      <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
                        Tipo de Envase Asociado
                      </label>
                      {envasesActivos.length === 0 ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-amber-700">
                          <span>
                            No tenés tipos de envase activos cargados todavía.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setMostrandoFormProducto(false);
                              setTabActiva('envases');
                              setMostrandoFormEnvase(true);
                            }}
                            className="font-bold underline text-primary"
                          >
                            + Crear tipo de envase primero
                          </button>
                        </div>
                      ) : (
                        <select
                          required
                          value={nuevoProducto.tipo_envase_id}
                          onChange={(e) =>
                            setNuevoProducto({
                              ...nuevoProducto,
                              tipo_envase_id: e.target.value,
                            })
                          }
                          className="w-full border-2 border-primary/30 rounded-2xl p-3.5 bg-white text-base font-semibold text-primary-dark focus:border-primary focus:outline-none"
                        >
                          <option value="">Seleccioná un envase...</option>
                          {envasesActivos.map((env) => (
                            <option key={env.id} value={env.id}>
                              {env.nombre} (Reposición: ${env.valor_reposicion})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-8 rounded-2xl tracking-wider text-base shadow-md transition-colors"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            )}

            {/* GRILLA DE PRODUCTOS */}
            {productos.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-xl mx-auto mt-6">
                <Package size={40} className="mx-auto text-primary/50 mb-3" />
                <h3 className="font-bold text-lg text-primary-dark">
                  Sin productos en el catálogo
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Agregá los productos o servicios que comercializás (ej. Bidón 20L, Pack de Cerveza, Hielo) para empezar a registrar ventas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {productos.map((prod) => (
                  <div
                    key={prod.id}
                    className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all flex flex-col justify-between ${
                      !prod.activo
                        ? 'border-dashed border-slate-300 opacity-60 grayscale'
                        : 'border-primary-light/20 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3.5">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                              prod.activo
                                ? 'bg-primary/10 text-primary'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Package size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-primary-dark text-lg tracking-wide leading-tight">
                              {prod.nombre}
                            </h3>
                            <p className="text-[11px] text-secondary font-mono mt-0.5 tracking-widest uppercase">
                              {prod.codigo}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleActivo(prod.id)}
                          className={`p-2 rounded-xl transition-colors ${
                            prod.activo
                              ? 'text-primary hover:bg-primary/10'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={prod.activo ? 'Desactivar' : 'Activar'}
                        >
                          {prod.activo ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>

                      {/* BADGES MULTI-RUBRO */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 uppercase">
                          <Layers size={12} />
                          {prod.unidad_medida || 'unidad'}
                        </span>
                        {prod.es_retornable ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Recycle size={12} />
                            {prod.tipo_envase?.nombre || 'Retornable'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700">
                            <Box size={12} />
                            Descartable / Directo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PRECIO */}
                    <div className="flex items-center justify-between bg-background p-3.5 rounded-2xl border border-primary-light/30">
                      {editandoId === prod.id ? (
                        <div className="flex items-center space-x-2 w-full justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary font-bold text-lg">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={nuevoPrecio}
                              onChange={(e) => setNuevoPrecio(e.target.value)}
                              className="w-28 border-2 border-primary bg-white rounded-xl p-2 font-black text-primary-dark text-lg text-center focus:outline-none"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => guardarPrecio(prod.id)}
                            className="bg-success text-white p-2.5 rounded-xl hover:bg-emerald-600 shadow-sm"
                          >
                            <Save size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-black text-lg text-primary-dark">
                            ${prod.precio_actual}
                          </span>
                          <button
                            onClick={() => iniciarEdicion(prod)}
                            className="text-primary bg-primary/10 hover:bg-primary hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors tracking-wide"
                          >
                            Modificar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* FORMULARIO NUEVO TIPO DE ENVASE */}
            {mostrandoFormEnvase && (
              <form
                onSubmit={handleCrearEnvase}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-md border-2 border-primary/20 mb-8 max-w-3xl mx-auto"
              >
                <h3 className="font-bold text-primary-dark text-xl mb-5 tracking-wide border-b border-primary-light/30 pb-3">
                  Registrar Tipo de Envase Retornable
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
                      Nombre del Envase
                    </label>
                    <input
                      required
                      type="text"
                      value={nuevoEnvase.nombre}
                      onChange={(e) =>
                        setNuevoEnvase({
                          ...nuevoEnvase,
                          nombre: e.target.value,
                          codigo: e.target.value,
                        })
                      }
                      className="w-full border-2 border-primary-light/30 rounded-2xl p-3.5 bg-slate-50 text-base font-medium focus:border-primary focus:outline-none"
                      placeholder="Ej: Bidón 20L / Cajón 12u / Barril 30L"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
                      Valor de Reposición ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={nuevoEnvase.valor_reposicion}
                      onChange={(e) =>
                        setNuevoEnvase({
                          ...nuevoEnvase,
                          valor_reposicion: e.target.value,
                        })
                      }
                      className="w-full border-2 border-primary-light/30 rounded-2xl p-3.5 bg-slate-50 font-black text-primary text-lg focus:border-primary focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-8 rounded-2xl tracking-wider text-base shadow-md transition-colors"
                  >
                    Guardar Envase
                  </button>
                </div>
              </form>
            )}

            {/* GRILLA DE TIPOS DE ENVASE */}
            {tiposEnvase.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-xl mx-auto">
                <Recycle size={40} className="mx-auto text-primary/50 mb-3" />
                <h3 className="font-bold text-lg text-primary-dark">
                  Sin envases retornables configurados
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Creá los envases que prestás a tus clientes (ej. Bidón 20L, Cajón,
                  Garrafa) para llevar el control automático de saldos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {tiposEnvase.map((env) => (
                  <div
                    key={env.id}
                    className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${
                      !env.activo
                        ? 'border-dashed border-slate-300 opacity-60 grayscale'
                        : 'border-primary-light/20 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Recycle size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-primary-dark text-lg leading-tight">
                            {env.nombre}
                          </h3>
                          <p className="text-[11px] text-secondary font-mono mt-0.5 uppercase">
                            {env.codigo}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleEnvase(env.id)}
                        className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                        title={env.activo ? 'Desactivar' : 'Activar'}
                      >
                        {env.activo ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-background p-3.5 rounded-2xl border border-primary-light/30">
                      {editandoEnvaseId === env.id ? (
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary font-bold text-lg">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={nuevoValorReposicion}
                              onChange={(e) =>
                                setNuevoValorReposicion(e.target.value)
                              }
                              className="w-28 border-2 border-primary bg-white rounded-xl p-2 font-black text-primary-dark text-lg text-center focus:outline-none"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => guardarValorReposicion(env.id)}
                            className="bg-success text-white p-2.5 rounded-xl hover:bg-emerald-600 shadow-sm"
                          >
                            <Save size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="text-[11px] uppercase font-bold text-slate-400 block">
                              Valor Reposición
                            </span>
                            <span className="font-black text-lg text-primary-dark">
                              ${env.valor_reposicion}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setEditandoEnvaseId(env.id);
                              setNuevoValorReposicion(
                                env.valor_reposicion.toString()
                              );
                            }}
                            className="text-primary bg-primary/10 hover:bg-primary hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};