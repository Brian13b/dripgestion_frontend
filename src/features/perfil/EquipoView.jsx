import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Shield, Truck, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import { UsuarioModal } from './UsuarioModal';
import toast from 'react-hot-toast';

export const EquipoView = () => {
  const navigate = useNavigate();
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);

  const fetchEquipo = async () => {
    try {
      const data = await userService.getEquipo();
      setEquipo(data);
    } catch (error) {
      toast.error("Error al cargar equipo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEquipo(); }, []);

  const handleEditar = (id) => {
    setUsuarioEditandoId(id);
    setIsModalOpen(true);
  };

  const handleNuevo = () => {
    setUsuarioEditandoId(null);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro? El usuario ya no podrá ingresar al sistema.")) return;
    try {
      await userService.eliminarUsuario(id);
      toast.success("Usuario eliminado");
      fetchEquipo();
    } catch (error) {
      toast.error("No se pudo eliminar el usuario");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
          <div >
            <button onClick={() => navigate('/perfil')} className="hover:bg-white/20 bg-white/5 p-3 rounded-full transition-colors mr-4 shadow-sm backdrop-blur-sm shrink-0">
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Mi Equipo</h1>
          </div>
          <button onClick={handleNuevo} className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors p-3 md:px-6 rounded-2xl flex items-center shadow-sm font-bold text-lg">
            <Plus size={22} className="md:mr-2" /><span className="hidden md:inline tracking-wider">Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-5 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 opacity-30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="font-black uppercase tracking-widest">Cargando...</p>
          </div>
        ) : equipo.map(miembro => (
          <div key={miembro.id} className="bg-white p-5 rounded-3xl border border-primary-light/20 flex items-center justify-between shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${miembro.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-primary-light/20 text-primary'}`}>
                {miembro.role === 'admin' ? <Shield size={24}/> : <Truck size={24}/>}
              </div>
              <div>
                <p className="font-bold text-primary-dark text-lg leading-tight">{miembro.full_name}</p>
                <p className="text-sm text-secondary font-medium">{miembro.username} • <span className="capitalize">{miembro.role}</span></p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleEditar(miembro.id)} 
                className="p-3 text-primary hover:bg-primary-light/10 rounded-2xl transition-colors"
              >
                <Pencil size={20} />
              </button>
              <button 
                onClick={() => handleEliminar(miembro.id)} 
                className="p-3 text-danger hover:bg-danger/10 rounded-2xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <UsuarioModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={usuarioEditandoId} 
        onSuccess={fetchEquipo} 
      />
    </div>
  );
};