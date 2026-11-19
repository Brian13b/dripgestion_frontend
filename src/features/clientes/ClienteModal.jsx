import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalFooter } from '../../components/primitives/Modal';
import { Store, MapPin, Phone, MessageSquare, KeyRound, X, Lock, FileText, CheckCircle } from 'lucide-react';
import { notify } from '../../lib/notify';
import { clientesService } from '../../api/clienteService';
import { Button } from '../../components/primitives/Button';

export const ClienteModal = ({ isOpen, onClose, clienteId = null, onSuccess }) => {
  const isEditing = Boolean(clienteId);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPinConfigured, setHasPinConfigured] = useState(false);

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
          setHasPinConfigured(data.has_pin || false);
          setFormData({
            nombre_negocio: data.nombre_negocio || '',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            observaciones: data.observaciones || '',
            pin_acceso: '',
            cuit: data.cuit || '',
            condicion_iva: data.condicion_iva || 'Consumidor Final'
          });
        } catch (error) {
          notify.error("Error al cargar cliente");
          console.error(error);
          onClose();
        }
      };
      fetchCliente();
    } else if (isOpen && !isEditing) {
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      setHasPinConfigured(false);
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
        notify.success('Cliente actualizado');
      } else {
        clienteGuardado = await clientesService.create(dataToSend);
        notify.success('Cliente creado');
      }
      onSuccess(clienteGuardado); 
      onClose(); 
    } catch (err) {
      notify.error(err, 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal>
        
        {/* Header */}
        <ModalHeader title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={onClose} />

        {/* Formulario con Scroll */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="cliente-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Nombre / Negocio *</label>
              <div className="relative">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input type="text" name="nombre_negocio" required value={formData.nombre_negocio} onChange={handleChange} className="field pl-11 pr-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Dirección *</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input type="text" name="direccion" required value={formData.direccion} onChange={handleChange} className="field pl-11 pr-4" />
              </div>
            </div>

            {/* Seccion Fiscal */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">CUIT (Sin guiones)</label>
              <div className="relative">
                <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input type="text" name="cuit" maxLength="11" placeholder="20334445556" value={formData.cuit} onChange={handleChange} className="field pl-11 pr-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Condición IVA</label>
              <div className="relative">
                <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <select name="condicion_iva" value={formData.condicion_iva} onChange={handleChange} className="field pl-11 pr-4 appearance-none">
                  <option value="Consumidor Final">Consumidor Final</option>
                  <option value="Monotributista">Monotributista</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Exento">Exento</option>
                </select>
              </div>
            </div>

            {/* Teléfono y PIN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Teléfono *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange} className="field pl-11 pr-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">PIN Acceso</label>
                <div className="relative">
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full pl-4 pr-3 py-3 border-2 rounded-2xl bg-sand-100 border-sand-200">
                      <Lock size={18} className="text-secondary shrink-0" />
                      {hasPinConfigured
                        ? <span className="text-emerald-600 font-bold text-sm">PIN Configurado</span>
                        : <span className="text-secondary font-medium text-sm">Sin PIN</span>
                      }
                    </div>
                  ) : (
                    <>
                      <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input type="text" name="pin_acceso" required maxLength="4" value={formData.pin_acceso} onChange={handleChange}
                        className="field pl-11 pr-3 tracking-widest font-black text-center"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-2 tracking-widest ml-1">Observaciones</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-4 top-4 text-primary" />
                <textarea name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange} className="field pl-11 pr-4" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button
            type="submit"
            form="cliente-form"
            isLoading={isLoading}
            size="lg"
            fullWidth
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
          </Button>
        </ModalFooter>
      </Modal>
  );
};