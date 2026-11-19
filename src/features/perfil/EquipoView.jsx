import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { Button } from '../../components/primitives/Button';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Shield, Truck, Pencil, LogOut } from 'lucide-react';
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
      console.error(error);
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
      console.error(error);
    }
  };

  const handleLogoutRemoto = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro que querés cerrar todas las sesiones activas de ${nombre}?`)) return;
    try {
      await userService.logoutAllDevices(id);
      toast.success(`Sesiones de ${nombre} cerradas correctamente`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo cerrar la sesión");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <PageHeader
        onBack={() => navigate('/perfil')}
        title="Mi Equipo"
        actions={<HeaderAction icon={Plus} label="Nuevo Usuario" onClick={handleNuevo} />}
      />

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
              <Button 
                onClick={() => handleLogoutRemoto(miembro.id, miembro.full_name || miembro.username)} 
                title="Cerrar todas sus sesiones"
                variant="ghost" size="sm" iconOnly
              >
                <LogOut size={20} />
              </Button>
              <Button 
                onClick={() => handleEditar(miembro.id)} 
                variant="soft" size="sm" iconOnly
              >
                <Pencil size={20} />
              </Button>
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