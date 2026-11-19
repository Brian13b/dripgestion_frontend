import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { PageContent } from '../../components/primitives/PageContent';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { Modal, ModalHeader } from '../../components/primitives/Modal';
import { Button } from '../../components/primitives/Button';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, MapPin, Minus, Plus, Banknote, CreditCard, BookOpen, X, Search, UserPlus, Package, SkipForward, Recycle, Layers } from 'lucide-react';
import { recorridoService } from '../../api/recorridoService';
import { nuevaClaveIdempotencia } from '../../lib/idempotency';
import { clientesService } from '../../api/clienteService';
import { productosService } from '../../api/productoService';
import { ClienteModal } from '../clientes/ClienteModal';
import { useTenant } from '../../context/TenantContext';
import { notify } from '../../lib/notify';

export const RepartoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant();

  const STORAGE_KEY = `t_${tenant?.id || 'default'}_viaje_activo`;
  const TIEMPO_EXPIRACION = 20 * 60 * 60 * 1000;

  const cargarViajeLocal = () => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;

    const viaje = JSON.parse(guardado);
    const tiempoGuardado = viaje.timestamp || 0;
    const ahora = new Date().getTime();

    if (ahora - tiempoGuardado > TIEMPO_EXPIRACION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (viaje.recorridoId === id) return viaje;
    return null;
  };

  const [indiceActual, setIndiceActual] = useState(() => {
    const viajeValido = cargarViajeLocal();
    return viajeValido ? viajeValido.indiceActual : 0;
  });

  const [resumenViaje, setResumenViaje] = useState(() => {
    const viajeValido = cargarViajeLocal();
    return viajeValido
      ? viajeValido.resumenViaje
      : { efectivo: 0, transferencia: 0, fiado: 0, productos: {}, envases: {} };
  });

  const [clientesRuta, setClientesRuta] = useState(() => {
    const viajeValido = cargarViajeLocal();
    if (viajeValido && viajeValido.clientesRuta) {
      return viajeValido.clientesRuta;
    }
    return location.state?.clientes || location.state?.clientesRuta || [];
  });

  const clienteActual = clientesRuta[indiceActual];

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recorrido, setRecorrido] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [tiposEnvase, setTiposEnvase] = useState([]);

  const [movimientos, setMovimientos] = useState({});
  const [devolucionesDirectas, setDevolucionesDirectas] = useState({});

  const [descuento, setDescuento] = useState('');
  const [montoCobrado, setMontoCobrado] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');

  // Clave de idempotencia del guardado en curso: un reintento sin cambios no duplica la entrega.
  const claveEnvioRef = useRef(null);
  useEffect(() => {
    claveEnvioRef.current = null; // si el usuario edita algo, es una operación distinta
  }, [movimientos, devolucionesDirectas, descuento, montoCobrado, metodoPago, indiceActual]);

  // Modales
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [modalFormularioAbierta, setModalFormularioAbierta] = useState(false);

  useEffect(() => {
    const fetchClienteFresco = async () => {
      if (clientesRuta.length > 0 && clientesRuta[indiceActual]) {
        try {
          const clienteFresco = await clientesService.getById(
            clientesRuta[indiceActual].id
          );
          setClientesRuta((prevRuta) => {
            const nuevaRuta = [...prevRuta];
            nuevaRuta[indiceActual] = clienteFresco;
            return nuevaRuta;
          });
        } catch (error) {
          console.error('Error al refrescar datos del cliente', error);
        }
      }
    };

    fetchClienteFresco();
  }, [indiceActual]);

  useEffect(() => {
    if (clientesRuta && clientesRuta.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          recorridoId: id,
          clientesRuta,
          indiceActual,
          resumenViaje,
          timestamp: new Date().getTime(),
        })
      );
    }
  }, [id, clientesRuta, indiceActual, resumenViaje, STORAGE_KEY]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [rutaData, prods, envases] = await Promise.all([
          recorridoService.getById(id),
          productosService.getAll(),
          productosService.getTiposEnvase(true),
        ]);
        setRecorrido(rutaData);
        setCatalogo(prods);
        setTiposEnvase(envases);
      } catch (error) {
        notify.error(error, 'Error al cargar datos del recorrido');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [id]);

  useEffect(() => {
    if (!clienteActual && !loading) navigate('/recorridos');
    setMovimientos({});
    setDevolucionesDirectas({});
    setMontoCobrado('');
    setDescuento('');
    setMetodoPago('efectivo');
  }, [indiceActual, clienteActual, loading, navigate]);

  const updateCantidad = (prodId, tipo, incremento) => {
    setMovimientos((prev) => {
      const actual = prev[prodId]?.[tipo] || 0;
      const nuevo = actual + incremento;
      return {
        ...prev,
        [prodId]: {
          ...(prev[prodId] || { entregado: 0, devuelto: 0 }),
          [tipo]: nuevo < 0 ? 0 : nuevo,
        },
      };
    });
  };

  const updateDevolucionDirecta = (envaseId, incremento) => {
    setDevolucionesDirectas((prev) => {
      const actual = prev[envaseId] || 0;
      const nuevo = actual + incremento;
      const copia = { ...prev };
      if (nuevo <= 0) {
        delete copia[envaseId];
      } else {
        copia[envaseId] = nuevo;
      }
      return copia;
    });
  };

  const subtotalProductos = catalogo.reduce((acc, p) => {
    const entregados = movimientos[p.id]?.entregado || 0;
    return acc + entregados * p.precio_actual;
  }, 0);

  const descuentoNum = Number(descuento) || 0;
  const totalEntregaHoy = Math.max(0, subtotalProductos - descuentoNum);

  const saldoAnterior = clienteActual?.saldo_dinero || 0;
  const deudaTotal = saldoAnterior + totalEntregaHoy;
  const cobradoNum = Number(montoCobrado) || 0;
  const nuevoSaldoProyectado = Math.round(deudaTotal - cobradoNum);

  // MODAL AGREGAR
  const abrirModalAgregar = async () => {
    try {
      const todos = await clientesService.getAll();
      const idsEnRuta = clientesRuta.map((c) => c.id);
      setClientesDisponibles(todos.filter((c) => !idsEnRuta.includes(c.id)));
      setModalAgregarAbierto(true);
    } catch (e) {
      notify.error(e, 'Error al buscar clientes');
      console.error(e);
    }
  };

  const agregarClienteAlPaso = (cliente) => {
    const nuevasRutas = [...clientesRuta];
    // Fuera del recorrido: queda marcada como visita excepcional (se envia al backend y
    // se ve en el historial y la auditoria de caja).
    nuevasRutas.splice(indiceActual + 1, 0, { ...cliente, visita_excepcional: true });
    setClientesRuta(nuevasRutas);
    setModalAgregarAbierto(false);
    notify.success('Agregado como próxima parada');
  };

  const clientesFiltrados = clientesDisponibles.filter(
    (c) =>
      c.nombre_negocio.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.direccion.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  // GUARDAR ENTREGA Y ACUMULAR PARA EL RESUMEN
  const handleConfirmar = async () => {
    setIsSubmitting(true);

    const cobroFinal = metodoPago === 'cta_corriente' ? 0 : cobradoNum;

    const payload = {
      cliente_id: clienteActual.id,
      recorrido_id: recorrido.id,
      visita_excepcional: Boolean(clienteActual.visita_excepcional),
      detalles: movimientos,
      devoluciones_envases:
        Object.keys(devolucionesDirectas).length > 0
          ? devolucionesDirectas
          : null,
      monto_total: totalEntregaHoy,
      monto_cobrado: cobroFinal,
      metodo_pago: metodoPago,
      observacion:
        descuentoNum > 0 ? `Descuento aplicado: -$${descuentoNum}` : '',
    };

    try {
      if (!claveEnvioRef.current) claveEnvioRef.current = nuevaClaveIdempotencia();
      await recorridoService.registrarMovimiento(payload, claveEnvioRef.current);
      claveEnvioRef.current = null;

      const nuevosProductos = { ...resumenViaje.productos };
      const nuevosEnvases = { ...(resumenViaje.envases || {}) };

      catalogo.forEach((p) => {
        const mov = movimientos[p.id] || { entregado: 0, devuelto: 0 };
        if (mov.entregado > 0 || mov.devuelto > 0) {
          if (!nuevosProductos[p.id]) {
            nuevosProductos[p.id] = {
              nombre: p.nombre,
              es_retornable: p.es_retornable,
              entregado: 0,
              devuelto: 0,
            };
          }
          nuevosProductos[p.id].entregado += mov.entregado;
          nuevosProductos[p.id].devuelto += mov.devuelto;

          if (p.es_retornable && p.tipo_envase_id) {
            const envKey = String(p.tipo_envase_id);
            const envNombre = p.tipo_envase?.nombre || 'Envase';
            if (!nuevosEnvases[envKey]) {
              nuevosEnvases[envKey] = {
                nombre: envNombre,
                entregado: 0,
                devuelto: 0,
              };
            }
            nuevosEnvases[envKey].entregado += mov.entregado;
            nuevosEnvases[envKey].devuelto += mov.devuelto;
          }
        }
      });

      Object.entries(devolucionesDirectas).forEach(([envId, cant]) => {
        const tipo = tiposEnvase.find((e) => String(e.id) === String(envId));
        if (!nuevosEnvases[envId]) {
          nuevosEnvases[envId] = {
            nombre: tipo?.nombre || 'Envase',
            entregado: 0,
            devuelto: 0,
          };
        }
        nuevosEnvases[envId].devuelto += Number(cant);
      });

      const nuevoResumen = {
        efectivo:
          resumenViaje.efectivo + (metodoPago === 'efectivo' ? cobroFinal : 0),
        transferencia:
          resumenViaje.transferencia +
          (metodoPago === 'transferencia' ? cobroFinal : 0),
        fiado:
          resumenViaje.fiado +
          (metodoPago === 'cta_corriente' ? totalEntregaHoy : 0),
        productos: nuevosProductos,
        envases: nuevosEnvases,
      };

      setResumenViaje(nuevoResumen);
      notify.success(`Guardado. Nuevo saldo: $${Math.abs(nuevoSaldoProyectado)}`);

      avanzarOSalir(nuevoResumen);
    } catch (error) {
      notify.error(error, 'Error al guardar la entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avanzarOSalir = (resumenActualizado = resumenViaje) => {
    if (indiceActual < clientesRuta.length - 1) {
      setIndiceActual(indiceActual + 1);
      window.scrollTo(0, 0);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      navigate('/reparto/resumen', {
        state: { resumen: resumenActualizado, nombreRuta: recorrido?.nombre },
      });
    }
  };

  if (loading || !clienteActual) return null;

  const totalEnvasesCliente = Object.values(
    clienteActual.stock_envases || {}
  ).reduce((a, b) => a + Number(b || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* HEADER */}
      <PageHeader
        maxWidth="max-w-2xl"
        title="Recorrido en curso"
        subtitle={`Cliente ${indiceActual + 1} de ${clientesRuta.length}`}
      />

      {/* CONTENEDOR PRINCIPAL */}
      <PageContent maxWidth="max-w-2xl" className="space-y-5">
        {/* INFO CLIENTE */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/30 p-5 md:p-6 relative overflow-hidden">
          <span className="float-right bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
            {clienteActual.visita_excepcional ? 'Visita excepcional' : 'Pendiente'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2 tracking-wide pr-20">
            {clienteActual.nombre_negocio}
          </h2>
          <p className="flex items-start text-secondary text-sm md:text-base font-medium mb-5">
            <MapPin size={18} className="mr-2 text-primary shrink-0 mt-0.5" />{' '}
            {clienteActual.direccion}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sand-50 p-4 rounded-2xl border border-primary-light/20 flex flex-col justify-center">
              <p className="text-[10px] md:text-xs text-secondary uppercase font-bold tracking-wider mb-1">
                Saldo Histórico
              </p>
              <p
                className={`text-xl md:text-2xl font-black ${
                  saldoAnterior > 0
                    ? 'text-danger'
                    : saldoAnterior < 0
                    ? 'text-success'
                    : 'text-primary-dark'
                }`}
              >
                ${Math.abs(saldoAnterior)}{' '}
                <span className="text-sm font-bold opacity-70">
                  {saldoAnterior > 0 ? '(Debe)' : ''}
                </span>
              </p>
            </div>
            <div className="bg-sand-50 p-4 rounded-2xl border border-primary-light/20 flex flex-col justify-center">
              <p className="text-[10px] md:text-xs text-secondary uppercase font-bold tracking-wider mb-1">
                Envases Prestados
              </p>
              <p className="text-xl md:text-2xl font-black text-primary-dark">
                {totalEnvasesCliente}
              </p>
              {clienteActual.envases_detalle?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {clienteActual.envases_detalle.map((e) => (
                    <span
                      key={e.tipo_envase_id}
                      className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md"
                    >
                      {e.cantidad} {e.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CATÁLOGO DINÁMICO */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/30 p-5 md:p-6">
          <h3 className="font-bold text-primary-dark text-xl md:text-2xl mb-5 flex items-center border-b border-primary-light/20 pb-4 tracking-wide">
            <Package size={24} className="mr-3 text-primary" /> Carga y Entrega
          </h3>

          <div className="space-y-5">
            {catalogo
              .filter((p) => p.activo)
              .map((prod) => (
                <div
                  key={prod.id}
                  className="border-b border-primary-light/10 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <span className="font-bold text-primary-dark text-lg block">
                        {prod.nombre}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-sand-100 px-2 py-0.5 rounded-md uppercase">
                          <Layers size={11} />
                          {prod.unidad_medida || 'unidad'}
                        </span>
                        {prod.es_retornable && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Recycle size={11} />
                            {prod.tipo_envase?.nombre || 'Retornable'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0">
                      ${prod.precio_actual}
                    </span>
                  </div>

                  {prod.es_retornable ? (
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-sand-50 p-3 rounded-2xl border border-primary-light/20 flex flex-col items-center">
                        <span className="text-[10px] md:text-xs uppercase font-bold text-secondary tracking-widest mb-2">
                          Dejás (Llenos)
                        </span>
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => updateCantidad(prod.id, 'entregado', -1)}
                            variant="secondary" size="md" iconOnly
                          >
                            <Minus size={18} />
                          </Button>
                          <span className="w-6 text-center font-black text-xl text-primary-dark">
                            {movimientos[prod.id]?.entregado || 0}
                          </span>
                          <Button
                            onClick={() => updateCantidad(prod.id, 'entregado', 1)}
                            variant="secondary" size="md" iconOnly
                          >
                            <Plus size={18} />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-sand-50 p-3 rounded-2xl border border-primary-light/20 flex flex-col items-center">
                        <span className="text-[10px] md:text-xs uppercase font-bold text-secondary tracking-widest mb-2">
                          Te Llevás (Vacíos)
                        </span>
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => updateCantidad(prod.id, 'devuelto', -1)}
                            variant="secondary" size="md" iconOnly
                          >
                            <Minus size={18} />
                          </Button>
                          <span className="w-6 text-center font-black text-xl text-primary-dark">
                            {movimientos[prod.id]?.devuelto || 0}
                          </span>
                          <Button
                            onClick={() => updateCantidad(prod.id, 'devuelto', 1)}
                            variant="secondary" size="md" iconOnly
                          >
                            <Plus size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-sand-50 p-3 rounded-2xl border border-primary-light/20 flex items-center justify-between px-5">
                      <span className="text-xs uppercase font-bold text-secondary tracking-widest">
                        Cantidad Entregada
                      </span>
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => updateCantidad(prod.id, 'entregado', -1)}
                          variant="secondary" size="md" iconOnly
                        >
                          <Minus size={18} />
                        </Button>
                        <span className="w-6 text-center font-black text-xl text-primary-dark">
                          {movimientos[prod.id]?.entregado || 0}
                        </span>
                        <Button
                          onClick={() => updateCantidad(prod.id, 'entregado', 1)}
                          variant="secondary" size="md" iconOnly
                        >
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* DEVOLUCIÓN DIRECTA DE ENVASES VACÍOS */}
        {tiposEnvase.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-200/80 p-5 md:p-6">
            <h3 className="font-bold text-primary-dark text-base md:text-lg mb-1 flex items-center">
              <Recycle size={20} className="mr-2 text-emerald-600" />
              Retiro de Envases Vacíos (Solo devolución)
            </h3>
            <p className="text-xs text-secondary mb-4">
              Usá esta sección si el cliente devuelve envases sin llevar mercadería.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiposEnvase.map((env) => (
                <div
                  key={env.id}
                  className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-bold text-primary-dark truncate pr-2">
                    {env.nombre}
                  </span>
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <Button
                      onClick={() => updateDevolucionDirecta(env.id, -1)}
                      variant="secondary" size="sm" iconOnly
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-5 text-center font-black text-base text-emerald-800">
                      {devolucionesDirectas[env.id] || 0}
                    </span>
                    <Button
                      onClick={() => updateDevolucionDirecta(env.id, 1)}
                      variant="secondary" size="sm" iconOnly
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DESCUENTO */}
        <div className="bg-orange-50/80 rounded-3xl p-5 flex justify-between items-center border border-orange-200 shadow-sm">
          <span className="font-bold text-orange-800 text-base">
            Descuento Promocional
          </span>
          <div className="relative w-32">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-700 font-bold">
              $
            </span>
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              className="w-full bg-white rounded-xl py-3 pl-8 pr-4 font-black text-primary-dark text-right outline-none shadow-inner focus:border-orange-300 border border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* PAGO Y CALCULADORA */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/30 p-5 md:p-6">
          <h3 className="font-bold text-primary-dark text-lg mb-4 tracking-wide">
            Método de Pago
          </h3>
          <SegmentedControl
            fullWidth
            size="lg"
            className="mb-6"
            value={metodoPago}
            onChange={(v) => {
              setMetodoPago(v);
              if (v === 'cta_corriente') setMontoCobrado('');
            }}
            options={[
              { value: 'efectivo', label: 'Efectivo', icon: Banknote },
              { value: 'transferencia', label: 'Transf.', icon: CreditCard },
              { value: 'cta_corriente', label: 'Fiado', icon: BookOpen },
            ]}
          />

          <div className="space-y-3 text-base text-secondary mb-6 bg-sand-50 p-4 md:p-5 rounded-2xl border border-primary-light/20 font-medium">
            <div className="flex justify-between items-center">
              <p>Venta de hoy:</p>{' '}
              <p className="font-bold text-primary text-lg">${totalEntregaHoy}</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Deuda Anterior:</p> <p className="text-lg">${saldoAnterior}</p>
            </div>
            <div className="flex justify-between items-center border-t border-primary-light/30 pt-3 mt-1 font-black text-primary-dark text-xl">
              <p>Total a Pagar:</p> <p>${deudaTotal}</p>
            </div>
          </div>

          {metodoPago !== 'cta_corriente' && (
            <div className="mb-6 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <label className="block text-xs font-bold text-primary-dark uppercase tracking-widest mb-3 ml-1">
                ¿Cuánto abona ahora?
              </label>
              <div className="relative mb-3">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold text-xl">
                  $
                </span>
                <input
                  type="number"
                  value={montoCobrado}
                  onChange={(e) => setMontoCobrado(e.target.value)}
                  className="field field-lg pl-10 pr-4 font-black text-2xl"
                  placeholder="Ej: 5000"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setMontoCobrado(totalEntregaHoy.toString())}
                  variant="secondary" size="md" className="flex-1"
                >
                  Solo hoy
                </Button>
                <Button
                  onClick={() =>
                    setMontoCobrado(deudaTotal > 0 ? deudaTotal.toString() : '0')
                  }
                  variant="dark" size="md" className="flex-1"
                >
                  Saldar todo
                </Button>
              </div>
            </div>
          )}

          <div
            className={`rounded-2xl p-5 flex justify-between items-center border-2 ${
              nuevoSaldoProyectado > 0
                ? 'bg-danger/10 border-danger/20 text-danger'
                : 'bg-success/10 border-success/20 text-success'
            }`}
          >
            <span className="font-bold tracking-wide">
              {nuevoSaldoProyectado > 0 ? 'Queda debiendo:' : 'Saldo a favor:'}
            </span>
            <span className="text-2xl font-black">
              ${Math.abs(nuevoSaldoProyectado)}
            </span>
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex space-x-4 pt-4">
          <Button
            onClick={() => avanzarOSalir()}
            variant="secondary" size="lg" className="flex-1"
          >
            <SkipForward size={20} className="mr-2" /> Omitir
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isSubmitting}
            variant="primary" size="lg" className="flex-[2]"
          >
            {isSubmitting ? (
              'Guardando...'
            ) : (
              <>
                <Check size={24} className="mr-2" strokeWidth={3} /> Confirmar
              </>
            )}
          </Button>
        </div>

        {/* PAGINADOR Y AGREGAR AL PASO */}
        <div className="flex justify-between items-center px-2 py-6 text-sm font-bold text-secondary">
          <Button
            disabled={indiceActual === 0}
            onClick={() => setIndiceActual(indiceActual - 1)}
            variant="ghost" size="sm"
          >
            &lt; Anterior
          </Button>
          <Button
            onClick={abrirModalAgregar}
            variant="soft" size="md"
          >
            <UserPlus size={18} className="mr-2" /> Agregar al paso
          </Button>
          <Button
            disabled={indiceActual === clientesRuta.length - 1}
            onClick={() => setIndiceActual(indiceActual + 1)}
            variant="ghost" size="sm"
          >
            Siguiente &gt;
          </Button>
        </div>

        <Button
          variant="secondary" size="lg" fullWidth
          onClick={() => avanzarOSalir()}
          leftIcon={<Check size={20} strokeWidth={3} />}
        >
          Finalizar viaje
        </Button>
      </PageContent>

      {/* MODALES */}
      {modalAgregarAbierto && (
        <Modal tall>
          <ModalHeader title="Visita Excepcional" onClose={() => setModalAgregarAbierto(false)} />

            <div className="p-5 space-y-4 bg-sand-50 border-b border-primary-light/20 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-primary" size={20} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="field pl-12 pr-4"
                />
              </div>
              <Button
                onClick={() => setModalFormularioAbierta(true)}
                variant="soft" size="md" fullWidth
              >
                <UserPlus size={20} className="mr-2" /> Crear Cliente Nuevo
              </Button>
            </div>

            <div className="overflow-y-auto p-3 flex-1 space-y-2 bg-white scrollbar-thin">
              {clientesFiltrados.map((c) => (
                <button
                  key={c.id}
                  onClick={() => agregarClienteAlPaso(c)}
                  className="w-full text-left p-4 hover:bg-sand-50 border border-primary-light/10 hover:border-primary/30 rounded-2xl flex justify-between items-center group transition-all"
                >
                  <div>
                    <p className="font-bold text-primary-dark text-lg">
                      {c.nombre_negocio}
                    </p>
                    <p className="text-sm text-secondary font-medium truncate w-56">
                      {c.direccion}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Plus className="text-primary group-hover:text-white" size={18} />
                  </div>
                </button>
              ))}
            </div>
        </Modal>
      )}

      <ClienteModal
        isOpen={modalFormularioAbierta}
        onClose={() => setModalFormularioAbierta(false)}
        onSuccess={(c) => agregarClienteAlPaso(c)}
      />
    </div>
  );
};