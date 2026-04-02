import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pencil, Trash2, Package } from 'lucide-react';
import { clientesService } from '../../api/clienteService';
import { recorridoService } from '../../api/recorridoService';
import toast from 'react-hot-toast';
import { RecorridoModal } from './RecorridoModal';
import { ConfiguracionRutaModal } from './ConfiguracionRutaModal';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const RecorridosList = () => {
  const navigate = useNavigate();
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
    } catch (error) {
      toast.error("Error al cargar los datos");
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
    if (window.confirm(`¿Estás seguro que querés eliminar el recorrido "${nombre}"?`)) {
      try {
        await recorridoService.delete(id);
        setRecorridos(recorridos.filter(r => r.id !== id));
        toast.success("Recorrido eliminado");
      } catch (error) {
        toast.error("No se pudo eliminar el recorrido");
      }
    }
  };

  const handleComenzarRuta = (recorridoId, clientesActivos) => {
    navigate(`/reparto/${recorridoId}`, { state: { clientes: clientesActivos } });
  };

  const handleGuardarRuta = async (rutaEditada) => {
    if (!rutaEditada.nombre) return toast.error("El nombre es obligatorio");
    try {
      if (rutaEditada.id) {
        await recorridoService.update(rutaEditada.id, rutaEditada);
        toast.success("Ruta actualizada");
      } else {
        await recorridoService.create(rutaEditada);
        toast.success("Ruta creada");
      }
      setRutaParaConfigurar(null); 
      fetchData();
    } catch (e) { 
      toast.error("Error al guardar"); 
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center">
              <Package size={32} className="mr-3 text-white" />
              Rutas de Reparto
            </h1>
            <p className="text-primary-light text-sm md:text-base font-medium mt-1 tracking-wider">Organiza la logística de entregas</p>
          </div>
          <button 
            onClick={() => setRutaParaConfigurar({ id: null, nombre: '', dia_semana: 0, clientes_orden: [] })} 
            className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors p-3 md:px-6 rounded-2xl flex items-center shadow-sm font-bold text-lg"
          >
            <Plus size={22} className="md:mr-2" />
            <span className="hidden md:inline tracking-wider">Nueva Ruta</span>
          </button>
        </div>
      </div>

      {/* LISTA DE RECORRIDOS */}
      <div className="p-5 md:p-12 lg:px-20 max-w-7xl mx-auto mt-2">
        {loading ? (
          <p className="text-center text-secondary mt-10 text-xl tracking-wider">Cargando rutas...</p>
        ) : recorridos.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-secondary mb-4 text-xl">No hay recorridos configurados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {recorridos.map((recorrido) => {
              const clientesEnRuta = recorrido.clientes_orden || [];
              return (
                <div key={recorrido.id} className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 relative flex flex-col hover:shadow-md transition-shadow">
                  <div className="absolute top-6 right-5 flex space-x-2 text-gray-400">
                    <button onClick={() => setRutaParaConfigurar(recorrido)} className="bg-primary-light/20 p-2 rounded-xl text-primary hover:bg-primary-light/40 transition-colors"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(recorrido.id, recorrido.nombre)} className="bg-danger/10 p-2 rounded-xl text-danger hover:bg-danger/20 transition-colors"><Trash2 size={18} /></button>
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

                  <button onClick={() => setRutaParaPrevisualizar(recorrido)} disabled={clientesEnRuta.length === 0} className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold tracking-wider text-lg transition-all active:scale-95 ${clientesEnRuta.length > 0 ? 'bg-primary hover:bg-primary-dark text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    <Play size={20} className="mr-2 fill-current" />
                    Iniciar Ruta
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
          onClose={() => setRutaParaConfigurar(null)} 
          onSave={handleGuardarRuta} 
        />
      )}
    </div>
  );
};