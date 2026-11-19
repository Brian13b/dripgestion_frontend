import { useState } from 'react';
import { Modal, ModalHeader, ModalFooter } from '../../components/primitives/Modal';
import { Button } from '../../components/primitives/Button';
import { X, Search, ArrowUp, ArrowDown, Users } from 'lucide-react';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ConfiguracionRutaModal = ({ rutaInicial, clientes, onClose, onSave }) => {
  const [rutaEditando, setRutaEditando] = useState(() => {
    if (rutaInicial) {
      return { ...rutaInicial, clientes_orden: [...rutaInicial.clientes_orden] };
    }
    return { id: null, nombre: '', dia_semana: 0, clientes_orden: [] };
  });
  
  const [busquedaCliente, setBusquedaCliente] = useState('');

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
    <Modal tall>
        <ModalHeader title={rutaEditando.id ? 'Editar Ruta Fija' : 'Nueva Ruta'} onClose={onClose} />

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 mb-6">
            <input type="text" placeholder="Nombre de la ruta..." value={rutaEditando.nombre} onChange={e => setRutaEditando({...rutaEditando, nombre: e.target.value})} className="field field-lg tracking-wide text-xl" />
            <select value={rutaEditando.dia_semana} onChange={e => setRutaEditando({...rutaEditando, dia_semana: Number(e.target.value)})} className="field field-lg cursor-pointer">
              {DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <div className="border-t border-primary-light/20 pt-6">
            <h3 className="font-bold text-primary-dark text-lg mb-3 flex items-center"><Users size={20} className="mr-2 text-primary"/> Orden de Visita Fijo</h3>
            
            <div className="relative mb-4 z-20">
              <Search className="absolute left-3 top-3.5 text-primary" size={20}/>
              <input type="text" placeholder="Buscar cliente para agregar..." value={busquedaCliente} onChange={e=>setBusquedaCliente(e.target.value)} className="field pl-11"/>
              {busquedaCliente && (
                <div className="absolute top-15 left-0 w-full bg-white shadow-2xl border border-primary-light/20 rounded-2xl max-h-48 overflow-y-auto">
                  {clientesBuscados.map(c => (
                     <button key={c.id} onClick={() => {toggleClienteConfig(c.id); setBusquedaCliente('');}} className="w-full text-left p-4 hover:bg-sand-50 border-b border-primary-light/10 font-bold text-primary-dark flex justify-between">
                       {c.nombre_negocio} <span className="text-secondary font-medium text-sm">{rutaEditando.clientes_orden.includes(c.id) ? '(Ya en ruta)' : '+ Agregar'}</span>
                     </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 relative z-10">
              {rutaEditando.clientes_orden.length === 0 && <p className="text-secondary italic text-center py-4 bg-sand-50 rounded-2xl border border-dashed border-primary-light/40">Buscá y agregá clientes a esta ruta.</p>}
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
                      <Button disabled={index === 0} onClick={() => moverClienteConfig(index, -1)} variant="secondary" size="sm" iconOnly><ArrowUp size={20}/></Button>
                      <Button disabled={index === rutaEditando.clientes_orden.length - 1} onClick={() => moverClienteConfig(index, 1)} variant="secondary" size="sm" iconOnly><ArrowDown size={20}/></Button>
                      <Button onClick={() => toggleClienteConfig(clienteId)} variant="dangerSoft" size="sm" iconOnly><X size={20}/></Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button onClick={handleGuardar} variant="primary" size="lg" fullWidth>
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
  );
};