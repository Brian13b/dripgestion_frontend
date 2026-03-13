import React, { useState, useEffect } from 'react';
import { X, Search, ArrowUp, ArrowDown, Users } from 'lucide-react';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ConfiguracionRutaModal = ({ rutaInicial, clientes, onClose, onSave }) => {
  const [rutaEditando, setRutaEditando] = useState({ nombre: '', dia_semana: 0, clientes_orden: [] });
  const [busquedaCliente, setBusquedaCliente] = useState('');

  useEffect(() => {
    if (rutaInicial) {
      setRutaEditando({ ...rutaInicial, clientes_orden: [...rutaInicial.clientes_orden] });
    } else {
      setRutaEditando({ id: null, nombre: '', dia_semana: 0, clientes_orden: [] });
    }
  }, [rutaInicial]);

  const moverClienteConfig = (index, direccion) => {
    const nuevaLista = [...rutaEditando.clientes_orden];
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[index + direccion];
    nuevaLista[index + direccion] = temp;
    setRutaEditando({ ...rutaEditando, clientes_orden: nuevaLista });
  };

  const toggleClienteConfig = (clienteId) => {
    let nuevaLista = [...rutaEditando.clientes_orden];
    if (nuevaLista.includes(clienteId)) nuevaLista = nuevaLista.filter(id => id !== clienteId);
    else nuevaLista.push(clienteId);
    setRutaEditando({ ...rutaEditando, clientes_orden: nuevaLista });
  };

  const handleGuardar = () => {
    onSave(rutaEditando);
  };

  const clientesBuscados = busquedaCliente ? clientes.filter(c => c.nombre_negocio.toLowerCase().includes(busquedaCliente.toLowerCase())) : [];

  return (
    <div className="fixed inset-0 bg-primary-dark/90 z-[70] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
        <div className="p-5 border-b border-primary-light/20 flex justify-between items-center bg-background shrink-0">
          <h2 className="text-xl font-bold text-primary-dark tracking-wide">{rutaEditando.id ? 'Editar Ruta Fija' : 'Nueva Ruta'}</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary-dark bg-white rounded-full p-2 shadow-sm border border-primary-light/30"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 mb-6">
            <input type="text" placeholder="Nombre de la ruta..." value={rutaEditando.nombre} onChange={e => setRutaEditando({...rutaEditando, nombre: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-xl font-bold text-primary-dark tracking-wide outline-none" />
            <select value={rutaEditando.dia_semana} onChange={e => setRutaEditando({...rutaEditando, dia_semana: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary font-bold text-primary-dark text-lg outline-none cursor-pointer">
              {DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <div className="border-t border-primary-light/20 pt-6">
            <h3 className="font-bold text-primary-dark text-lg mb-3 flex items-center"><Users size={20} className="mr-2 text-primary"/> Orden de Visita Fijo</h3>
            
            <div className="relative mb-4 z-20">
              <Search className="absolute left-3 top-3.5 text-primary" size={20}/>
              <input type="text" placeholder="Buscar cliente para agregar..." value={busquedaCliente} onChange={e=>setBusquedaCliente(e.target.value)} className="w-full pl-11 py-3.5 rounded-2xl bg-slate-50 border-2 border-primary-light/20 focus:border-primary font-medium text-primary-dark outline-none"/>
              {busquedaCliente && (
                <div className="absolute top-[60px] left-0 w-full bg-white shadow-2xl border border-primary-light/20 rounded-2xl max-h-48 overflow-y-auto">
                  {clientesBuscados.map(c => (
                     <button key={c.id} onClick={() => {toggleClienteConfig(c.id); setBusquedaCliente('');}} className="w-full text-left p-4 hover:bg-slate-50 border-b border-primary-light/10 font-bold text-primary-dark flex justify-between">
                       {c.nombre_negocio} <span className="text-secondary font-medium text-sm">{rutaEditando.clientes_orden.includes(c.id) ? '(Ya en ruta)' : '+ Agregar'}</span>
                     </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 relative z-10">
              {rutaEditando.clientes_orden.length === 0 && <p className="text-secondary italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-primary-light/40">Buscá y agregá clientes a esta ruta.</p>}
              {rutaEditando.clientes_orden.map((clienteId, index) => {
                const c = clientes.find(x => x.id === clienteId);
                if(!c) return null;
                return (
                  <div key={clienteId} className="flex justify-between items-center p-3 border border-primary-light/30 rounded-2xl bg-white shadow-sm group">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black shrink-0">{index + 1}</span>
                      <span className="font-bold text-primary-dark truncate">{c.nombre_negocio}</span>
                    </div>
                    <div className="flex space-x-1 shrink-0 ml-2">
                      <button disabled={index === 0} onClick={() => moverClienteConfig(index, -1)} className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors"><ArrowUp size={20}/></button>
                      <button disabled={index === rutaEditando.clientes_orden.length - 1} onClick={() => moverClienteConfig(index, 1)} className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors"><ArrowDown size={20}/></button>
                      <button onClick={() => toggleClienteConfig(clienteId)} className="p-2 ml-1 text-danger hover:bg-danger/10 rounded-xl transition-colors"><X size={20}/></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-primary-light/20 bg-background shrink-0 rounded-b-[2rem]">
          <button onClick={handleGuardar} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-colors text-lg tracking-wide">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};