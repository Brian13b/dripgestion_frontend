import { useState } from 'react';
import { Modal, ModalHeader, ModalFooter } from '../../components/primitives/Modal';
import { Button } from '../../components/primitives/Button';
import { Play, X, Search, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { notify } from '../../lib/notify';

export const RecorridoModal = ({ recorrido, clientes, onClose, onComenzar }) => {
  const [clientesEnVistaPrevia, setClientesEnVistaPrevia] = useState(() => {
    if (recorrido?.clientes_orden) {
      return recorrido.clientes_orden.map(id => clientes.find(c => c.id === id)).filter(Boolean);
    }
    return [];
  });
  
  const [busquedaExcepcion, setBusquedaExcepcion] = useState('');

  const quitarCliente = (clienteId) => setClientesEnVistaPrevia(prev => prev.filter(c => c.id !== clienteId));
  
  const agregarExcepcion = (cliente) => {
    if (!clientesEnVistaPrevia.find(c => c.id === cliente.id)) {
      setClientesEnVistaPrevia([...clientesEnVistaPrevia, cliente]);
      notify.success("Agregado al recorrido de hoy");
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
    <Modal>
        <ModalHeader title={`Previa: ${recorrido.nombre}`} subtitle="Agregá excepciones, ordená o quitá clientes por hoy." onClose={onClose} />
        
        <div className="p-4 bg-sand-50 border-b border-primary-light/20 relative z-20 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-primary" size={20}/>
            <input type="text" placeholder="Buscar cliente para agregar hoy..." value={busquedaExcepcion} onChange={e=>setBusquedaExcepcion(e.target.value)} className="field pl-10 pr-4"/>
          </div>
          {busquedaExcepcion && (
            <div className="absolute top-15 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 max-h-40 overflow-y-auto z-50">
              {excepcionesBuscadas.map(c => (
                <button key={c.id} onClick={() => agregarExcepcion(c)} className="w-full text-left p-3 hover:bg-sand-50 border-b flex justify-between items-center text-primary-dark font-bold">
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
                <Button disabled={index === 0} onClick={() => moverCliente(index, -1)} variant="secondary" size="sm" iconOnly><ArrowUp size={20} /></Button>
                <Button disabled={index === clientesEnVistaPrevia.length - 1} onClick={() => moverCliente(index, 1)} variant="secondary" size="sm" iconOnly><ArrowDown size={20} /></Button>
                <Button onClick={() => quitarCliente(cliente.id)} variant="dangerSoft" size="sm" iconOnly><X size={20} /></Button>
              </div>
            </div>
          ))}
          {clientesEnVistaPrevia.length === 0 && <p className="text-center text-secondary py-6">Ruta vacía. Buscá un cliente arriba para agregarlo.</p>}
        </div>
        
        <ModalFooter>
          <Button onClick={() => onComenzar(recorrido.id, clientesEnVistaPrevia)} disabled={clientesEnVistaPrevia.length === 0} variant="primary" size="lg" fullWidth>
            <Play size={24} className="mr-2 fill-current" /> Confirmar e Iniciar
          </Button>
        </ModalFooter>
      </Modal>
  );
};