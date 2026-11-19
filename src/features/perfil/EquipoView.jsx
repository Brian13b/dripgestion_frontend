import { PageHeader, HeaderAction } from '../../components/primitives/PageHeader';
import { LoadingState, EmptyState } from '../../components/primitives/StateBlock';
import { useConfirm } from '../../components/primitives/ConfirmContext';
import { Button } from '../../components/primitives/Button';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Shield, Truck, Pencil, LogOut } from 'lucide-react';
import { userService } from '../../api/userService';
import { UsuarioModal } from './UsuarioModal';
import { notify } from '../../lib/notify';

export const EquipoView = () => {
  const confirm = useConfirm();
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);

  const fetchEquipo = async () => {
    try {
      const data = await userService.getEquipo();
      setEquipo(data);
    } catch (error) {
      notify.error("Error al cargar equipo");
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
    if (!(await confirm({ title: 'Eliminar usuario', message: 'El usuario ya no va a poder ingresar al sistema.', confirmLabel: 'Eliminar' }))) return;
    try {
      await userService.eliminarUsuario(id);
      notify.success("Usuario eliminado");
      fetchEquipo();
    } catch (error) {
      notify.error(error, "No se pudo eliminar el usuario");
      console.error(error);
    }
  };

  const handleLogoutRemoto = async (id, nombre) => {
    if (!(await confirm({ title: 'Cerrar sesiones', message: `Se van a cerrar todas las sesiones activas de ${nombre}.`, confirmLabel: 'Cerrar sesiones' }))) return;
    try {
      await userService.logoutAllDevices(id);
      notify.success(`Sesiones de ${nombre} cerradas correctamente`);
    } catch (error) {
      notify.error(error, "No se pudo cerrar la sesión");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <PageHeader
        title="Mi Equipo"
        subtitle="Repartidores y accesos"
        actions={<HeaderAction icon={Plus} label="Nuevo Usuario" onClick={handleNuevo} />}
      />

      <div className="max-w-4xl mx-auto p-5 space-y-4">
        {loading ? (
          <LoadingState label="Cargando equipo..." />
        ) : equipo.map(miembro => (
          <div key={miembro.id} className="bg-white p-5 rounded-3xl border border-primary-light/20 flex items-center justify-between shadow-sm">
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