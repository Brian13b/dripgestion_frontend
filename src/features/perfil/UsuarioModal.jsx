import React, { useState } from 'react';
import { User, Lock, Contact, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../api/userService';

export const UsuarioModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'repartidor'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userService.crearUsuario(formData);
      toast.success("Usuario creado con éxito");
      setFormData({ username: '', full_name: '', password: '', role: 'repartidor' });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al crear usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-dark/80 z-[100] flex items-end md:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b border-primary-light/20 flex justify-between items-center bg-background">
          <h2 className="text-2xl font-black text-primary-dark tracking-tight">Nuevo Integrante</h2>
          <button onClick={onClose} className="p-2 hover:bg-primary-light/20 rounded-full transition-colors"><X /></button>
        </div>

        <form id="user-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1">Nombre Completo</label>
            <div className="relative">
              <Contact className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="text"
                placeholder="Ej: Juan Pérez"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1">Usuario (Login)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="text"
                placeholder="juan.reparto"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1">Contraseña inicial</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="password"
                placeholder="* * * *"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary-light/30 rounded-2xl focus:border-primary bg-slate-50 font-medium"
              />
            </div>
          </div>
        </form>

        <div className="p-6 bg-background border-t border-primary-light/20">
          <button 
            type="submit" 
            form="user-form"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Guardando...' : <><Save size={20}/> Crear Usuario</>}
          </button>
        </div>
      </div>
    </div>
  );
};