import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trash2, Shield, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import { UsuarioModal } from './UsuarioModal';
import toast from 'react-hot-toast';

export const EquipoView = () => {
  const navigate = useNavigate();
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEquipo = async () => {
    try {
      const data = await userService.getEquipo();
      setEquipo(data);
    } catch (error) {
      toast.error("No se pudo cargar el equipo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEquipo(); }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este usuario? Perderá acceso al sistema.")) return;
    try {
      await userService.eliminarUsuario(id);
      toast.success("Usuario eliminado");
      fetchEquipo();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white p-6 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/perfil')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-black text-primary-dark">Mi Equipo</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <UserPlus size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-5 space-y-4">
        {loading ? (
          <p className="text-center py-10 opacity-50 font-bold uppercase tracking-widest">Cargando equipo...</p>
        ) : equipo.map(miembro => (
          <div key={miembro.id} className="bg-white p-5 rounded-3xl border border-primary-light/20 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${miembro.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-primary-light/20 text-primary'}`}>
                {miembro.role === 'admin' ? <Shield size={24}/> : <Truck size={24}/>}
              </div>
              <div>
                <p className="font-bold text-primary-dark text-lg">{miembro.full_name}</p>
                <p className="text-sm text-secondary font-medium">@{miembro.username} • <span className="capitalize">{miembro.role}</span></p>
              </div>
            </div>
            <button onClick={() => handleEliminar(miembro.id)} className="p-3 text-danger hover:bg-danger/10 rounded-2xl transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <UsuarioModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchEquipo} 
      />
    </div>
  );
};