import React, { useState, useEffect } from 'react';
import { User, Lock, Contact, X, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../api/userService';

export const UsuarioModal = ({ isOpen, onClose, userId = null, onSuccess }) => {
  const isEditing = Boolean(userId);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'repartidor'
  });

  useEffect(() => {
    if (isOpen && isEditing) {
      const cargarDatos = async () => {
        try {
          const data = await userService.getById(userId);
          setFormData({
            username: data.username,
            full_name: data.full_name || '',
            role: data.role,
            password: ''
          });
        } catch (error) {
          toast.error("Error al cargar datos del usuario");
          onClose();
        }
      };
      cargarDatos();
    } else if (isOpen) {
      setFormData({ username: '', full_name: '', password: '', role: 'repartidor' });
    }
  }, [isOpen, userId, isEditing]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userService.actualizarUsuario(userId, updateData);
        toast.success("Usuario actualizado");
      } else {
        await userService.crearUsuario(formData);
        toast.success("Usuario creado");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error en la operación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-dark/80 z-[100] flex items-end md:items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-primary-light/20 flex justify-between items-center bg-background">
          <h2 className="text-2xl font-black text-primary-dark tracking-tight">
            {isEditing ? 'Editar Integrante' : 'Nuevo Integrante'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-primary-light/10 rounded-full transition-colors"><X /></button>
        </div>

        <form id="user-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1 tracking-widest">Nombre Completo</label>
            <div className="relative">
              <Contact className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1 tracking-widest">Usuario (Login)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                disabled={isEditing}
                type="text"
                value={formData.username}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl ${isEditing ? 'bg-slate-100 border-slate-200 text-slate-500' : 'border-primary-light/30 bg-slate-50 focus:border-primary'}`}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1 tracking-widest">Rol del sistema</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-bold text-primary-dark appearance-none"
              >
                <option value="repartidor">REPARTIDOR</option>
                <option value="admin">ADMINISTRADOR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1 tracking-widest">
              {isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required={!isEditing}
                type="password"
                placeholder={isEditing ? "Dejar vacío para no cambiar" : "****"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50"
              />
            </div>
          </div>
        </form>

        <div className="p-6 bg-background border-t border-primary-light/20">
          <button 
            type="submit" 
            form="user-form"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Guardando...' : <><Save size={20}/> {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};