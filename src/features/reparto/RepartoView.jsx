import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, MapPin, Minus, Plus, Banknote, CreditCard, BookOpen, X, Search, UserPlus, Package, ArrowRight, SkipForward } from 'lucide-react';
import { recorridoService } from '../../api/recorridoService';
import { clientesService } from '../../api/clienteService';
import { productosService } from '../../api/productoService';
import { ClienteModal } from '../clientes/ClienteModal';
import { useTenant } from '../../context/TenantContext';
import toast from 'react-hot-toast';

export const RepartoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tenant = useTenant();
  
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
    return viajeValido ? viajeValido.resumenViaje : { efectivo: 0, transferencia: 0, fiado: 0, productos: {} };
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

  const [movimientos, setMovimientos] = useState({});
  const [descuento, setDescuento] = useState('');
  const [montoCobrado, setMontoCobrado] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');

  // Modales
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [modalFormularioAbierta, setModalFormularioAbierta] = useState(false);

  useEffect(() => {
    const fetchClienteFresco = async () => {
      if (clientesRuta.length > 0 && clientesRuta[indiceActual]) {
        try {
          const clienteFresco = await clientesService.getById(clientesRuta[indiceActual].id);
          
          setClientesRuta(prevRuta => {
            const nuevaRuta = [...prevRuta];
            nuevaRuta[indiceActual] = clienteFresco;
            return nuevaRuta;
          });
        } catch (error) {
          console.error("Error al refrescar datos del cliente", error);
        }
      }
    };
    
    fetchClienteFresco();
  }, [indiceActual]);

  useEffect(() => {
    if (clientesRuta && clientesRuta.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        recorridoId: id,
        clientesRuta,
        indiceActual,
        resumenViaje,
        timestamp: new Date().getTime()
      }));
    }
  }, [id, clientesRuta, indiceActual, resumenViaje, STORAGE_KEY]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const rutaData = await recorridoService.getById(id);
        setRecorrido(rutaData);
        const prods = await productosService.getAll();
        setCatalogo(prods);
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [id]);

  useEffect(() => {
    if (!clienteActual && !loading) navigate('/recorridos');
    setMovimientos({});
    setMontoCobrado(''); 
    setDescuento('');
    setMetodoPago('efectivo');
  }, [indiceActual, clienteActual, loading, navigate]);

  const updateCantidad = (prodId, tipo, incremento) => {
    setMovimientos(prev => {
      const actual = prev[prodId]?.[tipo] || 0;
      const nuevo = actual + incremento;
      return {
        ...prev,
        [prodId]: {
          ...(prev[prodId] || { entregado: 0, devuelto: 0 }),
          [tipo]: nuevo < 0 ? 0 : nuevo
        }
      };
    });
  };

  const subtotalEnvases = catalogo.reduce((acc, p) => {
    const entregados = movimientos[p.id]?.entregado || 0;
    return acc + (entregados * p.precio_actual);
  }, 0);
  
  const descuentoNum = Number(descuento) || 0;
  const totalEntregaHoy = subtotalEnvases - descuentoNum;
  
  const saldoAnterior = clienteActual?.saldo_dinero || 0;
  const deudaTotal = saldoAnterior + totalEntregaHoy;
  const cobradoNum = Number(montoCobrado) || 0;
  const nuevoSaldoProyectado = Math.round(deudaTotal - cobradoNum);

  // MODAL AGREGAR
  const abrirModalAgregar = async () => {
    try {
      const todos = await clientesService.getAll();
      const idsEnRuta = clientesRuta.map(c => c.id);
      setClientesDisponibles(todos.filter(c => !idsEnRuta.includes(c.id)));
      setModalAgregarAbierto(true);
    } catch (e) { toast.error("Error al buscar"); }
  };

  const agregarClienteAlPaso = (cliente) => {
    const nuevasRutas = [...clientesRuta];
    nuevasRutas.splice(indiceActual + 1, 0, cliente);
    setClientesRuta(nuevasRutas);
    setModalAgregarAbierto(false);
    toast.success(`Agregado como próxima parada`);
  };

  const clientesFiltrados = clientesDisponibles.filter(c => 
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
      detalles: movimientos, 
      monto_total: totalEntregaHoy,
      monto_cobrado: cobroFinal,
      metodo_pago: metodoPago,
      observacion: descuentoNum > 0 ? `Descuento aplicado: -$${descuentoNum}` : ""
    };

    try {
      await recorridoService.registrarMovimiento(payload);

      const nuevosProductos = { ...resumenViaje.productos };

      catalogo.forEach(p => {
         const mov = movimientos[p.id] || { entregado: 0, devuelto: 0 };
         if (mov.entregado > 0 || mov.devuelto > 0) {
           if (!nuevosProductos[p.id]) {
             nuevosProductos[p.id] = { nombre: p.nombre, entregado: 0, devuelto: 0 };
           }
           nuevosProductos[p.id].entregado += mov.entregado;
           nuevosProductos[p.id].devuelto += mov.devuelto;
         }
      });

      const nuevoResumen = {
        efectivo: resumenViaje.efectivo + (metodoPago === 'efectivo' ? cobroFinal : 0),
        transferencia: resumenViaje.transferencia + (metodoPago === 'transferencia' ? cobroFinal : 0),
        fiado: resumenViaje.fiado + (metodoPago === 'cta_corriente' ? totalEntregaHoy : 0),
        productos: nuevosProductos
      };

      setResumenViaje(nuevoResumen);
      toast.success(`Guardado. Nuevo saldo: $${Math.abs(nuevoSaldoProyectado)}`);
      
      avanzarOSalir(nuevoResumen);
      
    } catch (error) {
      toast.error("Error al guardar la entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avanzarOSalir = (resumenActualizado = resumenViaje) => {
    if (indiceActual < clientesRuta.length - 1) {
      setIndiceActual(indiceActual + 1);
      window.scrollTo(0, 0);
    } else {
      localStorage.removeItem('STORAGE_KEY');
      navigate('/reparto/resumen', { state: { resumen: resumenActualizado, nombreRuta: recorrido?.nombre } }); 
    }
  };

  if (loading || !clienteActual) return null;

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      
      {/* HEADER CON ESTÉTICA UNIFICADA */}
      <div className="bg-primary-dark p-5 md:px-12 pt-8 md:pt-12 sticky top-0 z-20 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-primary-light text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Recorrido en curso</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide">Cliente {indiceActual + 1} de {clientesRuta.length}</h1>
          </div>
          <button onClick={() => avanzarOSalir()} className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors p-3 md:px-5 rounded-2xl flex items-center shadow-sm font-bold text-sm md:text-base">
            <Check size={20} className="md:mr-2" strokeWidth={3} />
            <span className="hidden md:inline tracking-wider">Finalizar V.</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5 mt-4">
        
        {/* INFO CLIENTE */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/30 p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/10 rounded-bl-full -z-10"></div>
          
          <span className="float-right bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">Pendiente</span>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2 tracking-wide pr-20">{clienteActual.nombre_negocio}</h2>
          <p className="flex items-start text-secondary text-sm md:text-base font-medium mb-6"><MapPin size={18} className="mr-2 text-primary shrink-0 mt-0.5" /> {clienteActual.direccion}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-primary-light/20 flex flex-col justify-center">
               <p className="text-[10px] md:text-xs text-secondary uppercase font-bold tracking-wider mb-1">Saldo Histórico</p>
               <p className={`text-xl md:text-2xl font-black ${saldoAnterior > 0 ? 'text-danger' : saldoAnterior < 0 ? 'text-success' : 'text-primary-dark'}`}>
                 ${Math.abs(saldoAnterior)} <span className="text-sm font-bold opacity-70">{saldoAnterior > 0 ? '(Debe)' : ''}</span>
               </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-primary-light/20 flex flex-col justify-center">
              <p className="text-[10px] md:text-xs text-secondary uppercase font-bold tracking-wider mb-1">Envases Prestados</p>
              <p className="text-xl md:text-2xl font-black text-primary-dark">{Object.values(clienteActual.stock_envases || {}).reduce((a, b) => a + b, 0)}</p>
            </div>
          </div>
        </div>

        {/* CATÁLOGO DINÁMICO */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/30 p-5 md:p-6">
          <h3 className="font-bold text-primary-dark text-xl md:text-2xl mb-5 flex items-center border-b border-primary-light/20 pb-4 tracking-wide">
            <Package size={24} className="mr-3 text-primary"/> Registro de Envases
          </h3>
          
          <div className="space-y-5">
            {catalogo.filter(p => p.activo).map(prod => (
              <div key={prod.id} className="border-b border-primary-light/10 pb-5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-primary-dark text-lg">{prod.nombre}</span>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">${prod.precio_actual}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-primary-light/20 flex flex-col items-center">
                    <span className="text-[10px] md:text-xs uppercase font-bold text-secondary tracking-widest mb-2">Dejás</span>
                    <div className="flex items-center space-x-4">
                      <button onClick={() => updateCantidad(prod.id, 'entregado', -1)} className="w-10 h-10 rounded-full border border-primary-light/30 bg-white shadow-sm flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white transition-colors active:scale-95"><Minus size={18}/></button>
                      <span className="w-6 text-center font-black text-xl text-primary-dark">{movimientos[prod.id]?.entregado || 0}</span>
                      <button onClick={() => updateCantidad(prod.id, 'entregado', 1)} className="w-10 h-10 rounded-full border border-primary-light/30 bg-white shadow-sm flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white transition-colors active:scale-95"><Plus size={18}/></button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-2xl border border-primary-light/20 flex flex-col items-center">
                    <span className="text-[10px] md:text-xs uppercase font-bold text-secondary tracking-widest mb-2">Te Llevás</span>
                    <div className="flex items-center space-x-4">
                      <button onClick={() => updateCantidad(prod.id, 'devuelto', -1)} className="w-10 h-10 rounded-full border border-primary-light/30 bg-white shadow-sm flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white transition-colors active:scale-95"><Minus size={18}/></button>
                      <span className="w-6 text-center font-black text-xl text-primary-dark">{movimientos[prod.id]?.devuelto || 0}</span>
                      <button onClick={() => updateCantidad(prod.id, 'devuelto', 1)} className="w-10 h-10 rounded-full border border-primary-light/30 bg-white shadow-sm flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white transition-colors active:scale-95"><Plus size={18}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESCUENTO */}
        <div className="bg-orange-50/80 rounded-3xl p-5 flex justify-between items-center border border-orange-200 shadow-sm">
           <span className="font-bold text-orange-800 text-base">Descuento Promocional</span>
           <div className="relative w-32">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-700 font-bold">$</span>
             <input type="number" value={descuento} onChange={e => setDescuento(e.target.value)} className="w-full bg-white rounded-xl py-3 pl-8 pr-4 font-black text-primary-dark text-right outline-none shadow-inner focus:border-orange-300 border border-transparent" placeholder="0" />
           </div>
        </div>

        {/* PAGO Y CALCULADORA */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/30 p-5 md:p-6">
          <h3 className="font-bold text-primary-dark text-lg mb-4 tracking-wide">Método de Pago</h3>
          <div className="flex space-x-3 mb-6">
            <button onClick={() => setMetodoPago('efectivo')} className={`flex-1 py-4 flex flex-col items-center rounded-2xl border-2 transition-colors ${metodoPago === 'efectivo' ? 'border-primary bg-primary/5 text-primary' : 'border-primary-light/20 text-secondary hover:bg-slate-50'}`}><Banknote size={24}/><span className="text-xs md:text-sm font-bold mt-2">Efectivo</span></button>
            <button onClick={() => setMetodoPago('transferencia')} className={`flex-1 py-4 flex flex-col items-center rounded-2xl border-2 transition-colors ${metodoPago === 'transferencia' ? 'border-primary bg-primary/5 text-primary' : 'border-primary-light/20 text-secondary hover:bg-slate-50'}`}><CreditCard size={24}/><span className="text-xs md:text-sm font-bold mt-2">Transf.</span></button>
            <button onClick={() => {setMetodoPago('cta_corriente'); setMontoCobrado('');}} className={`flex-1 py-4 flex flex-col items-center rounded-2xl border-2 transition-colors ${metodoPago === 'cta_corriente' ? 'border-primary bg-primary/5 text-primary' : 'border-primary-light/20 text-secondary hover:bg-slate-50'}`}><BookOpen size={24}/><span className="text-xs md:text-sm font-bold mt-2">Fiado</span></button>
          </div>

          <div className="space-y-3 text-base text-secondary mb-6 bg-slate-50 p-4 md:p-5 rounded-2xl border border-primary-light/20 font-medium">
            <div className="flex justify-between items-center"><p>Venta de hoy:</p> <p className="font-bold text-primary text-lg">${totalEntregaHoy}</p></div>
            <div className="flex justify-between items-center"><p>Deuda Anterior:</p> <p className="text-lg">${saldoAnterior}</p></div>
            <div className="flex justify-between items-center border-t border-primary-light/30 pt-3 mt-1 font-black text-primary-dark text-xl"><p>Total a Pagar:</p> <p>${deudaTotal}</p></div>
          </div>

          {metodoPago !== 'cta_corriente' && (
            <div className="mb-6 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <label className="block text-xs font-bold text-primary-dark uppercase tracking-widest mb-3 ml-1">¿Cuánto abona ahora?</label>
              <div className="relative mb-3">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold text-xl">$</span>
                <input type="number" value={montoCobrado} onChange={(e) => setMontoCobrado(e.target.value)} className="w-full bg-white border-2 border-primary-light/30 rounded-2xl py-4 pl-10 pr-4 text-2xl font-black text-primary-dark focus:border-primary outline-none shadow-inner" placeholder="Ej: 5000" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMontoCobrado(totalEntregaHoy.toString())} className="flex-1 text-sm bg-white border border-primary-light/30 text-primary-dark py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">Solo hoy</button>
                <button onClick={() => setMontoCobrado(deudaTotal > 0 ? deudaTotal.toString() : '0')} className="flex-1 text-sm bg-primary-dark text-white py-3 rounded-xl font-bold hover:bg-primary transition-colors shadow-sm">Saldar todo</button>
              </div>
            </div>
          )}

          <div className={`rounded-2xl p-5 flex justify-between items-center border-2 ${nuevoSaldoProyectado > 0 ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
            <span className="font-bold tracking-wide">{nuevoSaldoProyectado > 0 ? 'Queda debiendo:' : 'Saldo a favor:'}</span>
            <span className="text-2xl font-black">${Math.abs(nuevoSaldoProyectado)}</span>
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex space-x-4 pt-4">
          <button onClick={() => avanzarOSalir()} className="flex-1 py-5 bg-white border border-primary-light/40 text-secondary rounded-2xl font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center text-lg">
            <SkipForward size={20} className="mr-2" /> Omitir
          </button>
          <button onClick={handleConfirmar} disabled={isSubmitting} className="flex-[2] py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold flex justify-center items-center shadow-lg active:scale-95 disabled:opacity-70 transition-all text-xl tracking-wide">
            {isSubmitting ? 'Guardando...' : <><Check size={24} className="mr-2" strokeWidth={3}/> Confirmar</>}
          </button>
        </div>

        {/* PAGINADOR Y AGREGAR AL PASO */}
        <div className="flex justify-between items-center px-2 py-6 text-sm font-bold text-secondary">
          <button disabled={indiceActual === 0} onClick={() => setIndiceActual(indiceActual - 1)} className="disabled:opacity-30 hover:text-primary-dark transition-colors">&lt; Anterior</button>
          <button onClick={abrirModalAgregar} className="flex items-center text-primary bg-primary/10 px-5 py-2.5 rounded-full font-black active:scale-95 transition-transform border border-primary/20"><UserPlus size={18} className="mr-2"/> Agregar al paso</button>
          <button disabled={indiceActual === clientesRuta.length - 1} onClick={() => setIndiceActual(indiceActual + 1)} className="disabled:opacity-30 hover:text-primary-dark transition-colors">Siguiente &gt;</button>
        </div>
      </div>

      {/* MODALES */}
      {modalAgregarAbierto && (
        <div className="fixed inset-0 bg-primary-dark/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col h-[75vh] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-primary-light/20 flex justify-between items-center bg-background shrink-0">
              <h2 className="text-xl font-bold text-primary-dark tracking-wide">Visita Excepcional</h2>
              <button onClick={() => setModalAgregarAbierto(false)} className="text-secondary hover:text-primary-dark bg-white p-2 rounded-full shadow-sm border border-primary-light/30"><X size={20}/></button>
            </div>
            
            <div className="p-5 space-y-4 bg-slate-50 border-b border-primary-light/20 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-primary" size={20}/>
                <input type="text" placeholder="Buscar cliente..." value={busquedaCliente} onChange={e=>setBusquedaCliente(e.target.value)} className="w-full bg-white border-2 border-primary-light/20 focus:border-primary outline-none rounded-2xl py-3 pl-12 pr-4 text-primary-dark font-medium"/>
              </div>
              <button onClick={() => setModalFormularioAbierta(true)} className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3.5 rounded-2xl flex justify-center active:scale-95 transition-all border border-primary/20">
                <UserPlus size={20} className="mr-2"/> Crear Cliente Nuevo
              </button>
            </div>
            
            <div className="overflow-y-auto p-3 flex-1 space-y-2 bg-white scrollbar-thin">
              {clientesFiltrados.map(c => (
                <button key={c.id} onClick={() => agregarClienteAlPaso(c)} className="w-full text-left p-4 hover:bg-slate-50 border border-primary-light/10 hover:border-primary/30 rounded-2xl flex justify-between items-center group transition-all">
                  <div>
                    <p className="font-bold text-primary-dark text-lg">{c.nombre_negocio}</p>
                    <p className="text-sm text-secondary font-medium truncate w-56">{c.direccion}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Plus className="text-primary group-hover:text-white" size={18}/>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <ClienteModal isOpen={modalFormularioAbierta} onClose={() => setModalFormularioAbierta(false)} onSuccess={(c) => agregarClienteAlPaso(c)} />
    </div>
  );
};