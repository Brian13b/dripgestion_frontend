import React, { useState, useEffect } from 'react';
import { Play, X, Search, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const RecorridoModal = ({ recorrido, clientes, onClose, onComenzar }) => {
  const [clientesEnVistaPrevia, setClientesEnVistaPrevia] = useState([]);
  const [busquedaExcepcion, setBusquedaExcepcion] = useState('');

  useEffect(() => {
    if (recorrido) {
      const clientesCompletos = recorrido.clientes_orden.map(id => clientes.find(c => c.id === id)).filter(Boolean);
      setClientesEnVistaPrevia(clientesCompletos);
    }
  }, [recorrido, clientes]);

  const quitarCliente = (clienteId) => setClientesEnVistaPrevia(prev => prev.filter(c => c.id !== clienteId));
  
  const agregarExcepcion = (cliente) => {
    if (!clientesEnVistaPrevia.find(c => c.id === cliente.id)) {
      setClientesEnVistaPrevia([...clientesEnVistaPrevia, cliente]);
      toast.success("Agregado al recorrido de hoy");
    }
    setBusquedaExcepcion('');
  };

  const moverCliente = (index, direccion) => {
    const nuevaLista = [...clientesEnVistaPrevia];
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[index + direccion];
    nuevaLista[index + direccion] = temp;
    setClientesEnVistaPrevia(nuevaLista);
  };

  const excepcionesBuscadas = busquedaExcepcion ? clientes.filter(c => c.nombre_negocio.toLowerCase().includes(busquedaExcepcion.toLowerCase())) : [];

  if (!recorrido) return null;

  return (
    <div className="fixed inset-0 bg-primary-dark/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-primary-light/20 flex justify-between items-center bg-background shrink-0">
          <div>
            <h2 className="text-xl font-bold text-primary-dark tracking-wide">Previa: {recorrido.nombre}</h2>
            <p className="text-sm text-secondary mt-1 font-medium">Agregá excepciones, ordená o quitá clientes por hoy.</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary-dark bg-white rounded-full p-2 shadow-sm border border-primary-light/30">
            <X size={20} />
          </button>
        </div>
        
        {/* Buscador de clientes */}
        <div className="p-4 bg-slate-50 border-b border-primary-light/20 relative z-20 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-primary" size={20}/>
            <input type="text" placeholder="Buscar cliente para agregar hoy..." value={busquedaExcepcion} onChange={e=>setBusquedaExcepcion(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-primary-light/30 focus:border-primary font-medium text-primary-dark outline-none"/>
          </div>
          {busquedaExcepcion && (
            <div className="absolute top-[60px] left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 max-h-40 overflow-y-auto z-50">
              {excepcionesBuscadas.map(c => (
                <button key={c.id} onClick={() => agregarExcepcion(c)} className="w-full text-left p-3 hover:bg-slate-50 border-b flex justify-between items-center text-primary-dark font-bold">
                  {c.nombre_negocio} <Plus className="text-primary"/>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-white scrollbar-thin">
          {clientesEnVistaPrevia.map((cliente, index) => (
            <div key={cliente.id} className="flex items-center justify-between bg-background p-3 md:p-4 rounded-2xl border border-primary-light/30 hover:border-primary transition-colors group">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">{index + 1}</div>
                <div>
                  <p className="font-bold text-primary-dark text-base md:text-lg tracking-wide leading-none mb-1 truncate">{cliente.nombre_negocio}</p>
                  <p className="text-xs md:text-sm text-secondary truncate w-32 md:w-56">{cliente.direccion}</p>
                </div>
              </div>
              <div className="flex space-x-1 shrink-0 ml-2">
                <button disabled={index === 0} onClick={() => moverCliente(index, -1)} className="p-2 bg-white shadow-sm border border-primary-light/20 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors"><ArrowUp size={20} /></button>
                <button disabled={index === clientesEnVistaPrevia.length - 1} onClick={() => moverCliente(index, 1)} className="p-2 bg-white shadow-sm border border-primary-light/20 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors"><ArrowDown size={20} /></button>
                <button onClick={() => quitarCliente(cliente.id)} className="text-danger bg-white shadow-sm border border-danger/20 p-2 rounded-xl hover:bg-danger hover:text-white transition-colors ml-1"><X size={20} /></button>
              </div>
            </div>
          ))}
          {clientesEnVistaPrevia.length === 0 && <p className="text-center text-secondary py-6">Ruta vacía. Buscá un cliente arriba para agregarlo.</p>}
        </div>
        
        <div className="p-5 bg-background border-t border-primary-light/20 shrink-0">
          <button onClick={() => onComenzar(recorrido.id, clientesEnVistaPrevia)} disabled={clientesEnVistaPrevia.length === 0} className="w-full py-4 font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl flex items-center justify-center text-xl tracking-wider shadow-md disabled:opacity-50 transition-colors">
            <Play size={24} className="mr-2 fill-current" /> Confirmar e Iniciar
          </button>
        </div>
      </div>
    </div>
  );
};