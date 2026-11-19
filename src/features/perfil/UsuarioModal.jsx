import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalFooter } from '../../components/primitives/Modal';
import { Button } from '../../components/primitives/Button';
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
          console.error(error);
          onClose();
        }
      };
      cargarDatos();
    } else if (isOpen) {
      setFormData({ username: '', full_name: '', password: '', role: 'repartidor' });
    }
  }, [isOpen, userId, isEditing, onClose]);

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
    <Modal sheet>
        <ModalHeader title={isEditing ? 'Editar Integrante' : 'Nuevo Integrante'} onClose={onClose} />

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
                className="field pl-12 pr-4"
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
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl ${isEditing ? 'bg-sand-100 border-sand-200 text-secondary' : 'border-primary-light/30 bg-sand-50 focus:border-primary'}`}
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
                className="field pl-12 pr-4 appearance-none"
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
                className="field pl-12 pr-4"
              />
            </div>
          </div>
        </form>

        <ModalFooter>
          <Button 
            type="submit" 
            form="user-form"
            disabled={isLoading}
            variant="primary" size="lg" fullWidth
          >
            {isLoading ? 'Guardando...' : <><Save size={20}/> {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</>}
          </Button>
        </ModalFooter>
      </Modal>
  );
};