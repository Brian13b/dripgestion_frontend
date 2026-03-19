import React, { useState } from 'react';
import { DollarSign, X, Banknote, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientesService } from '../../api/clienteService';

export const CobroModal = ({ isOpen, onClose, cliente, onSuccess }) => {
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('transferencia');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !cliente) return null;

  const handleCobrar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientesService.registrarPago(cliente.id, {
        monto: parseFloat(monto),
        metodo_pago: metodo,
        observacion: ""
      });
      toast.success("Pago registrado con éxito");
      onSuccess(); 
      onClose();
    } catch (error) {
      toast.error("Error al registrar el pago");
    } finally {
      setLoading(false);
      setMonto('');
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-dark/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-primary-light/20 flex justify-between items-center bg-background">
          <h2 className="text-xl font-bold text-primary-dark tracking-wide">Registrar Pago</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary-dark bg-white rounded-full p-2 shadow-sm border border-primary-light/30"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleCobrar} className="space-y-5">
            <div>
              <p className="text-sm text-secondary">Cliente</p>
              <p className="font-bold text-primary-dark">{cliente.nombre_negocio}</p>
              <div className="mt-2 inline-block bg-background px-3 py-1 rounded-full text-sm">
                Saldo actual: <span className={cliente.saldo_dinero > 0 ? 'text-danger font-bold' : 'text-success font-bold'}>${cliente.saldo_dinero}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary uppercase mb-2">Monto a cobrar ($)</label>
              <input required type="number" min="1" value={monto} onChange={e => setMonto(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-background font-bold text-xl text-center focus:ring-2 focus:ring-primary" placeholder="0" autoFocus />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setMonto(cliente.saldo_dinero > 0 ? cliente.saldo_dinero : '')} className="flex-1 text-xs bg-slate-100 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-200">Saldar total</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary uppercase mb-2">Método</label>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setMetodo('transferencia')} className={`flex-1 py-2 flex items-center justify-center rounded-xl border ${metodo === 'transferencia' ? 'border-primary bg-primary/10 text-primary' : 'text-slate-500'} text-sm font-semibold`}><CreditCard size={16} className="mr-2"/> Transf.</button>
                <button type="button" onClick={() => setMetodo('efectivo')} className={`flex-1 py-2 flex items-center justify-center rounded-xl border ${metodo === 'efectivo' ? 'border-primary bg-primary/10 text-primary' : 'text-slate-500'} text-sm font-semibold`}><Banknote size={16} className="mr-2"/> Efectivo</button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-primary-light/20 bg-background rounded-b-[2rem]">
          <button type="submit" disabled={loading || !monto} className="w-full bg-success text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 disabled:opacity-70 transition-colors text-lg tracking-wide">
            {loading ? 'Guardando...' : 'Confirmar Cobro'}
          </button>
        </div>
      </div>
    </div>
  );
};