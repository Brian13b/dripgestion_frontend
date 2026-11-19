import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { PageContent } from '../../components/primitives/PageContent';
import { LoadingState, EmptyState } from '../../components/primitives/StateBlock';
import { useConfirm } from '../../components/primitives/ConfirmContext';
import { Button } from '../../components/primitives/Button';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pencil, Trash2, Package, CalendarDays, Truck } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../api/userService';
import { clientesService } from '../../api/clienteService';
import { recorridoService } from '../../api/recorridoService';
import { notify } from '../../lib/notify';
import { RecorridoModal } from './RecorridoModal';
import { ConfiguracionRutaModal } from './ConfiguracionRutaModal';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const RecorridosList = () => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const esAdmin = user?.role?.toLowerCase() === 'admin';
  const [repartidores, setRepartidores] = useState([]);
  const [recorridos, setRecorridos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [rutaParaPrevisualizar, setRutaParaPrevisualizar] = useState(null);
  const [rutaParaConfigurar, setRutaParaConfigurar] = useState(null);

  const fetchData = async () => {
    try {
      const [recorridosRes, clientesRes] = await Promise.all([
        recorridoService.getAll(),
        clientesService.getAll()
      ]);
      setRecorridos(recorridosRes);
      setClientes(clientesRes);
      if (esAdmin) {
        const equipo = await userService.getEquipo();
        setRepartidores(equipo.filter(u => u.role?.toLowerCase() === 'repartidor' && u.is_active));
      }
    } catch (error) {
      notify.error(error, "Error al cargar los datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getNombreCliente = (id) => {
    const cliente = clientes.find(c => c.id === id);
    return cliente ? cliente.nombre_negocio : 'Cliente eliminado';
  };

  const handleDelete = async (id, nombre) => {
    if (await confirm({ title: 'Eliminar recorrido', message: `Vas a eliminar "${nombre}". No se puede deshacer.`, confirmLabel: 'Eliminar' })) {
      try {
        await recorridoService.delete(id);
        setRecorridos(recorridos.filter(r => r.id !== id));
        notify.success("Recorrido eliminado");
      } catch (error) {
        notify.error(error, "No se pudo eliminar el recorrido");
        console.error(error);
      }
    }
  };

  const handleComenzarRuta = (recorridoId, clientesActivos) => {
    navigate(`/reparto/${recorridoId}`, { state: { clientes: clientesActivos } });
  };

  const handleGuardarRuta = async (rutaEditada) => {
    if (!rutaEditada.nombre) return notify.error("El nombre es obligatorio");
    try {
      if (rutaEditada.id) {
        await recorridoService.update(rutaEditada.id, rutaEditada);
        const anterior = recorridos.find(r => r.id === rutaEditada.id);
        if ((anterior?.repartidor_id ?? null) !== (rutaEditada.repartidor_id ?? null)) {
          await recorridoService.asignarRepartidor(rutaEditada.id, rutaEditada.repartidor_id ?? null);
        }
        notify.success("Ruta actualizada");
      } else {
        await recorridoService.create(rutaEditada);
        notify.success("Ruta creada");
      }
      setRutaParaConfigurar(null); 
      fetchData();
    } catch (e) { 
      notify.error(e, "Error al guardar");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* HEADER */}
      <PageHeader
        title="Rutas de Reparto"
        subtitle="Organizá las entregas"
        actions={
          <HeaderAction
            icon={Plus}
            label="Nueva Ruta"
            onClick={() => setRutaParaConfigurar({ id: null, nombre: '', dia_semana: 0, clientes_orden: [], repartidor_id: null })}
          />
        }
      />

      {/* LISTA DE RECORRIDOS */}
      <PageContent>
        <div className="mb-5">
          <Button variant="secondary" size="md" onClick={() => navigate('/calendario')}>
            <CalendarDays size={18} /> Ver calendario de salidas
          </Button>
        </div>
        {loading ? (
          <LoadingState label="Cargando rutas..." />
        ) : recorridos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No hay rutas configuradas"
            description='Creá la primera con el botón "Nueva Ruta".'
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {recorridos.map((recorrido) => {
              const clientesEnRuta = recorrido.clientes_orden || [];
              return (
                <div key={recorrido.id} className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 relative flex flex-col hover:shadow-md transition-shadow">
                  <div className="absolute top-6 right-5 flex space-x-2 text-gray-400">
                    <Button onClick={() => setRutaParaConfigurar(recorrido)} variant="soft" size="sm" iconOnly><Pencil size={18} /></Button>
                    <Button onClick={() => handleDelete(recorrido.id, recorrido.nombre)} variant="dangerSoft" size="sm" iconOnly><Trash2 size={18} /></Button>
                  </div>

                  <h3 className="font-bold text-primary-dark text-2xl mb-3 pr-24 tracking-wide leading-tight">{recorrido.nombre}</h3>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider">
                      {DIAS_SEMANA[recorrido.dia_semana]}
                    </span>
                    <span className="text-secondary font-medium tracking-wide">
                      {clientesEnRuta.length} paradas
                    </span>
                  </div>

                  {esAdmin && (
                    <p className="flex items-center gap-2 text-sm font-semibold text-secondary mb-4 -mt-3">
                      <Truck size={16} className="text-primary shrink-0" />
                      {repartidores.find(r => r.id === recorrido.repartidor_id)?.full_name || (recorrido.repartidor_id ? 'Chofer asignado' : 'Sin chofer habitual')}
                    </p>
                  )}

                  <div className="space-y-3 mb-6 flex-1">
                    {clientesEnRuta.slice(0, 3).map((clienteId, index) => (
                      <div key={clienteId} className="flex items-center text-sm md:text-base text-primary-dark font-medium">
                        <div className="w-6 h-6 rounded-full bg-primary-light/30 text-primary flex items-center justify-center text-xs font-bold mr-3 shrink-0">{index + 1}</div>
                        <span className="truncate">{getNombreCliente(clienteId)}</span>
                      </div>
                    ))}
                    {clientesEnRuta.length > 3 && <p className="text-sm text-secondary ml-9 italic tracking-wide">+ {clientesEnRuta.length - 3} más...</p>}
                    {clientesEnRuta.length === 0 && <p className="text-sm text-danger bg-danger/10 p-3 rounded-xl tracking-wide">Ruta vacía. Asigná clientes.</p>}
                  </div>

                  <button onClick={() => setRutaParaPrevisualizar(recorrido)} disabled={clientesEnRuta.length === 0} className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold tracking-wider text-lg transition-all active:scale-95 ${clientesEnRuta.length > 0 ? 'bg-primary hover:bg-primary-dark text-white shadow-md' : 'bg-sand-100 text-secondary cursor-not-allowed'}`}>
                    <Play size={20} className="mr-2 fill-current" />
                    Iniciar Ruta
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </PageContent>

      {/* --- MODALES --- */}
      {rutaParaPrevisualizar && (
        <RecorridoModal 
          recorrido={rutaParaPrevisualizar} 
          clientes={clientes} 
          onClose={() => setRutaParaPrevisualizar(null)} 
          onComenzar={handleComenzarRuta} 
        />
      )}

      {rutaParaConfigurar && (
        <ConfiguracionRutaModal 
          rutaInicial={rutaParaConfigurar.id ? rutaParaConfigurar : null} 
          clientes={clientes} 
          repartidores={repartidores}
          onClose={() => setRutaParaConfigurar(null)} 
          onSave={handleGuardarRuta} 
        />
      )}
    </div>
  );
};