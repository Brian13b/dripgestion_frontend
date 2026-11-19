import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { PageContent } from '../../components/primitives/PageContent';
import { LoadingState, EmptyState } from '../../components/primitives/StateBlock';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { Button } from '../../components/primitives/Button';
import { useState, useEffect } from 'react';
import { Tag, Save, Package, Plus, X, Eye, EyeOff, Recycle, Box, Layers } from 'lucide-react';
import { notify } from '../../lib/notify';
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
      notify.error(error, 'Error al cargar el catálogo');
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

  const cancelarEdicionPrecio = () => {
    setEditandoId(null);
    setNuevoPrecio('');
  };

  const guardarPrecio = async (id) => {
    try {
      await productosService.updatePrecio(id, nuevoPrecio);
      notify.success('Precio actualizado');
      setEditandoId(null);
      cargarTodo();
    } catch (error) {
      notify.error(error, 'Error al actualizar');
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (nuevoProducto.es_retornable && !nuevoProducto.tipo_envase_id) {
      notify.error('Seleccioná el tipo de envase retornable');
      return;
    }

    try {
      await productosService.create({
        nombre: nuevoProducto.nombre.trim(),
        codigo: (nuevoProducto.codigo || nuevoProducto.nombre)
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '_'),
        precio_actual: parseFloat(nuevoProducto.precio_actual),
        unidad_medida: nuevoProducto.unidad_medida,
        es_retornable: nuevoProducto.es_retornable,
        tipo_envase_id: nuevoProducto.es_retornable
          ? parseInt(nuevoProducto.tipo_envase_id, 10)
          : null,
        activo: true,
      });
      notify.success('Producto agregado al catálogo');
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
      notify.error(error, 'Error al crear producto');
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await productosService.toggleActivo(id);
      cargarTodo();
      notify.success('Estado actualizado');
    } catch (error) {
      notify.error(error, 'Error al cambiar estado');
      console.error(error);
    }
  };

  // --- HANDLERS TIPOS DE ENVASE ---
  const handleCrearEnvase = async (e) => {
    e.preventDefault();
    try {
      await productosService.createTipoEnvase({
        nombre: nuevoEnvase.nombre.trim(),
        codigo: (nuevoEnvase.codigo || nuevoEnvase.nombre)
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '_'),
        valor_reposicion: parseFloat(nuevoEnvase.valor_reposicion || 0),
        activo: true,
      });
      notify.success('Tipo de envase creado');
      setMostrandoFormEnvase(false);
      setNuevoEnvase({ nombre: '', codigo: '', valor_reposicion: '' });
      cargarTodo();
    } catch (error) {
      notify.error(error, 'Error al crear tipo de envase');
    }
  };

  const cancelarEdicionEnvase = () => {
    setEditandoEnvaseId(null);
    setNuevoValorReposicion('');
  };

  const guardarValorReposicion = async (id) => {
    try {
      await productosService.updateTipoEnvase(id, {
        valor_reposicion: parseFloat(nuevoValorReposicion || 0),
      });
      notify.success('Valor de reposición actualizado');
      setEditandoEnvaseId(null);
      cargarTodo();
    } catch (error) {
      notify.error(error, 'Error al actualizar envase');
    }
  };

  const handleToggleEnvase = async (id) => {
    try {
      await productosService.toggleTipoEnvase(id);
      cargarTodo();
      notify.success('Estado del envase actualizado');
    } catch (error) {
      notify.error(error, 'Error al cambiar estado del envase');
      console.error(error);
    }
  };

  const envasesActivos = tiposEnvase.filter((e) => e.activo);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* HEADER */}
      <PageHeader
        title="Catálogo y Envases"
        subtitle="Precios y retornables"
        actions={
          tabActiva === 'productos' ? (
            <HeaderAction
              icon={mostrandoFormProducto ? X : Plus}
              label={mostrandoFormProducto ? 'Cerrar' : 'Nuevo Producto'}
              onClick={() => setMostrandoFormProducto(!mostrandoFormProducto)}
            />
          ) : (
            <HeaderAction
              icon={mostrandoFormEnvase ? X : Plus}
              label={mostrandoFormEnvase ? 'Cerrar' : 'Nuevo Envase'}
              onClick={() => setMostrandoFormEnvase(!mostrandoFormEnvase)}
            />
          )
        }
      />

      {/* CONTENIDO PRINCIPAL */}
      <PageContent>
        {loading ? (
          <LoadingState label="Cargando catálogo..." />
        ) : (
          <>
            {/* TABS FUERA DEL HEADER Y SIEMPRE VISIBLES */}
            <SegmentedControl
              className="mb-6"
              value={tabActiva}
              onChange={setTabActiva}
              options={[
                { value: 'productos', label: `Productos (${productos.length})`, icon: Package },
                { value: 'envases', label: `Envases Retornables (${tiposEnvase.length})`, icon: Recycle },
              ]}
            />

            {tabActiva === 'productos' ? (
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
                          className="field"
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
                          className="field field-lg font-black"
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
                          className="field"
                        >
                          {UNIDADES_MEDIDA.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col justify-center">
                        <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl border-2 border-primary-light/30 bg-sand-50 hover:border-primary transition">
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
                            <span className="text-xs text-secondary">
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
                                className="font-bold underline text-primary cursor-pointer"
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
                              className="field"
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
                      <Button
                        type="submit"
                        variant="primary" size="lg" className="w-full md:w-auto"
                      >
                        Guardar Producto
                      </Button>
                    </div>
                  </form>
                )}

                {/* GRILLA DE PRODUCTOS */}
                {productos.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-sand-200 max-w-xl mx-auto mt-6">
                    <Package size={40} className="mx-auto text-primary/50 mb-3" />
                    <h3 className="font-bold text-lg text-primary-dark">
                      Sin productos en el catálogo
                    </h3>
                    <p className="text-sm text-secondary mt-1">
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
                            ? 'border-dashed border-sand-200 opacity-60 grayscale'
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
                                    : 'bg-sand-100 text-secondary'
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
                              type="button"
                              onClick={() => handleToggleActivo(prod.id)}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                prod.activo
                                  ? 'text-primary hover:bg-primary/10'
                                  : 'text-secondary hover:bg-sand-100'
                              }`}
                              title={prod.activo ? 'Desactivar' : 'Activar'}
                            >
                              {prod.activo ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                          </div>

                          {/* BADGES MULTI-RUBRO */}
                          <div className="flex flex-wrap gap-2 mb-5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-sand-100 text-secondary uppercase">
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
                            <div className="flex items-center gap-2 w-full justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-primary font-bold text-lg">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={nuevoPrecio}
                                  onChange={(e) => setNuevoPrecio(e.target.value)}
                                  className="w-28 border-2 border-primary bg-white rounded-xl p-2 font-black text-primary-dark text-lg text-center focus:outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={cancelarEdicionPrecio}
                                  className="bg-sand-200 text-primary-dark p-2.5 rounded-xl hover:bg-sand-200 transition cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => guardarPrecio(prod.id)}
                                  className="bg-success text-white p-2.5 rounded-xl hover:bg-emerald-600 shadow-sm transition cursor-pointer"
                                  title="Guardar"
                                >
                                  <Save size={18} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-black text-lg text-primary-dark">
                                ${prod.precio_actual}
                              </span>
                              <button
                                type="button"
                                onClick={() => iniciarEdicion(prod)}
                                className="text-primary bg-primary/10 hover:bg-primary hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors tracking-wide cursor-pointer"
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
                          className="field"
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
                          className="field field-lg font-black"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary" size="lg" className="w-full md:w-auto"
                      >
                        Guardar Envase
                      </Button>
                    </div>
                  </form>
                )}

                {/* GRILLA DE TIPOS DE ENVASE */}
                {tiposEnvase.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-sand-200 max-w-xl mx-auto">
                    <Recycle size={40} className="mx-auto text-primary/50 mb-3" />
                    <h3 className="font-bold text-lg text-primary-dark">
                      Sin envases retornables configurados
                    </h3>
                    <p className="text-sm text-secondary mt-1">
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
                            ? 'border-dashed border-sand-200 opacity-60 grayscale'
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
                          <Button
                            type="button"
                            onClick={() => handleToggleEnvase(env.id)}
                            variant="soft" size="sm" iconOnly
                            title={env.activo ? 'Desactivar' : 'Activar'}
                          >
                            {env.activo ? <Eye size={20} /> : <EyeOff size={20} />}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between bg-background p-3.5 rounded-2xl border border-primary-light/30">
                          {editandoEnvaseId === env.id ? (
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-primary font-bold text-lg">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={nuevoValorReposicion}
                                  onChange={(e) =>
                                    setNuevoValorReposicion(e.target.value)
                                  }
                                  className="w-28 border-2 border-primary bg-white rounded-xl p-2 font-black text-primary-dark text-lg text-center focus:outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={cancelarEdicionEnvase}
                                  className="bg-sand-200 text-primary-dark p-2.5 rounded-xl hover:bg-sand-200 transition cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => guardarValorReposicion(env.id)}
                                  className="bg-success text-white p-2.5 rounded-xl hover:bg-emerald-600 shadow-sm transition cursor-pointer"
                                  title="Guardar"
                                >
                                  <Save size={18} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <span className="text-[11px] uppercase font-bold text-secondary block">
                                  Valor Reposición
                                </span>
                                <span className="font-black text-lg text-primary-dark">
                                  ${env.valor_reposicion}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditandoEnvaseId(env.id);
                                  setNuevoValorReposicion(
                                    env.valor_reposicion.toString()
                                  );
                                }}
                                className="text-primary bg-primary/10 hover:bg-primary hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
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
          </>
        )}
      </PageContent>
    </div>
  );
};