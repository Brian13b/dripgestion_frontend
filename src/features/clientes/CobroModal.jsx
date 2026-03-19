import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, MessageSquare, KeyRound, X, Lock, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientesService } from '../../api/clienteService';

export const ClienteModal = ({ isOpen, onClose, clienteId = null, onSuccess }) => {
  const isEditing = Boolean(clienteId);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre_negocio: '', 
    direccion: '', 
    telefono: '', 
    observaciones: '', 
    pin_acceso: '',
    cuit: '',
    condicion_iva: 'Consumidor Final'
  });

  useEffect(() => {
    if (isOpen && isEditing) {
      const fetchCliente = async () => {
        try {
          const data = await clientesService.getById(clienteId);
          setFormData({
            nombre_negocio: data.nombre_negocio || '',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            observaciones: data.observaciones || '',
            pin_acceso: data.pin_acceso || '',
            cuit: data.cuit || '',
            condicion_iva: data.condicion_iva || 'Consumidor Final'
          });
        } catch (error) {
          toast.error("Error al cargar cliente");
          onClose();
        }
      };
      fetchCliente();
    } else if (isOpen && !isEditing) {
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      setFormData({ 
        nombre_negocio: '', 
        direccion: '', 
        telefono: '', 
        observaciones: '', 
        pin_acceso: randomPin,
        cuit: '',
        condicion_iva: 'Consumidor Final'
      });
    }
  }, [isOpen, isEditing, clienteId, onClose]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = { ...formData };
    if (isEditing) delete dataToSend.pin_acceso;

    try {
      let clienteGuardado;
      if (isEditing) {
        clienteGuardado = await clientesService.update(clienteId, dataToSend);
        toast.success('Cliente actualizado');
      } else {
        clienteGuardado = await clientesService.create(dataToSend);
        toast.success('Cliente creado');
      }
      onSuccess(clienteGuardado); 
      onClose(); 
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary-dark/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-primary-light/20 flex justify-between items-center bg-background shrink-0">
          <h2 className="text-xl font-bold text-primary-dark tracking-wide">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary-dark bg-white rounded-full p-2 shadow-sm border border-primary-light/30"><X size={20} /></button>
        </div>

        {/* Formulario con Scroll */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="cliente-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Nombre / Negocio *</label>
              <div className="relative">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input type="text" name="nombre_negocio" required value={formData.nombre_negocio} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-bold text-primary-dark" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Dirección *</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input type="text" name="direccion" required value={formData.direccion} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-medium text-primary-dark" />
              </div>
            </div>

            {/* Seccion Fiscal */}
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Información Fiscal</p>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">CUIT (Sin guiones)</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input type="text" name="cuit" maxLength="11" placeholder="20334445556" value={formData.cuit} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-white font-bold text-primary-dark" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Condición IVA</label>
                  <div className="relative">
                    <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <select name="condicion_iva" value={formData.condicion_iva} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-white font-bold text-primary-dark appearance-none">
                      <option value="Consumidor Final">Consumidor Final</option>
                      <option value="Monotributista">Monotributista</option>
                      <option value="Responsable Inscripto">Responsable Inscripto</option>
                      <option value="Exento">Exento</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Teléfono y PIN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Teléfono *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange} className="w-full pl-11 pr-3 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-bold text-primary-dark" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">PIN Acceso</label>
                <div className="relative">
                  {isEditing ? <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /> : <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />}
                  <input type="text" name="pin_acceso" required={!isEditing} maxLength="4" readOnly={isEditing} value={formData.pin_acceso} onChange={handleChange} 
                    className={`w-full pl-11 pr-3 py-3 border-2 rounded-2xl tracking-widest font-black text-center ${isEditing ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-primary-light/30 bg-slate-50 focus:border-primary text-primary-dark'}`} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Observaciones</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-4 top-4 text-primary" />
                <textarea name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-medium text-primary-dark" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-primary-light/20 bg-background shrink-0">
          <button type="submit" form="cliente-form" disabled={isLoading} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 disabled:opacity-70 transition-colors text-lg">
            {isLoading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};