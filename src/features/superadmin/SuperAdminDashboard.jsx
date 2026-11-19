import React, { useEffect, useState, useContext } from 'react';
import { PageContent } from '../../components/primitives/PageContent';
import { useConfirm } from '../../components/primitives/ConfirmContext';
import { Button } from '../../components/primitives/Button';
import { PageHeader } from '../../components/primitives/PageHeader';
import { Modal, ModalHeader } from '../../components/primitives/Modal';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { ShieldCheck, LogOut, Building2, Plus, Power, PowerOff, ExternalLink, Pencil, X } from 'lucide-react';
import { notify } from '../../lib/notify';

export default function SuperAdminDashboard() {
  const confirm = useConfirm();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    subdominio: '',
    whatsapp: '',
    color_primario: '#25A7DA',
    admin_full_name: '',
    admin_username: '',
    admin_password: '',
  });

  const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || 'vercel.app';

  const [editingTenant, setEditingTenant] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleOpenEdit = (tenant) => {
    setEditingTenant({
      id: tenant.id,
      nombre: tenant.nombre || '',
      subdominio: tenant.subdominio || '',
      whatsapp: tenant.whatsapp || '',
      color_primario: tenant.color_primario || '#25A7DA',
    });
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await api.put(`/tenants/${editingTenant.id}`, {
        nombre: editingTenant.nombre,
        subdominio: editingTenant.subdominio.toLowerCase().trim(),
        whatsapp: editingTenant.whatsapp,
        color_primario: editingTenant.color_primario,
      });
      setTenants((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      notify.success(`Datos de "${data.nombre}" actualizados.`);
      setEditingTenant(null);
    } catch (err) {
      notify.error(err, 'Error al actualizar la distribuidora.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchTenants = async () => {
    try {
      const { data } = await api.get('/tenants/');
      setTenants(data);
    } catch (err) {
      notify.error('Error al cargar las distribuidoras.');
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tenants/onboarding', formData);
      notify.success(`Distribuidora "${formData.nombre}" creada con éxito.`);
      setFormData({
        nombre: '',
        subdominio: '',
        whatsapp: '',
        color_primario: '#25A7DA',
        admin_full_name: '',
        admin_username: '',
        admin_password: '',
      });
      fetchTenants();
    } catch (err) {
      notify.error(err, 'Error al registrar la empresa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (tenant) => {
    const nuevoEstado = !tenant.is_active;
    const accion = nuevoEstado ? 'habilitar' : 'suspender';
    if (!(await confirm({ title: `${nuevoEstado ? 'Habilitar' : 'Suspender'} acceso`, message: `¿Querés ${accion} el acceso a ${tenant.nombre}?`, confirmLabel: nuevoEstado ? 'Habilitar' : 'Suspender', tone: nuevoEstado ? 'primary' : 'danger' }))) return;

    try {
      await api.patch(`/tenants/${tenant.id}/estado?activo=${nuevoEstado}`);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, is_active: nuevoEstado } : t))
      );
      notify.success(`Acceso ${nuevoEstado ? 'habilitado' : 'suspendido'} para ${tenant.nombre}`);
    } catch (err) {
      notify.error(err, 'No se pudo actualizar el estado de la empresa.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 font-sans">
      <PageHeader
        maxWidth="max-w-6xl"
        title="Panel SuperAdmin"
        subtitle="Distribuidoras y accesos"
      />

      <PageContent maxWidth="max-w-6xl" className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-secondary font-medium">
            Hola, {user?.full_name || 'Administrador'} · <span className="font-bold text-primary-dark">{tenants.length} empresas</span>
          </p>
          <Button variant="dangerSoft" size="md" onClick={handleLogout} leftIcon={<LogOut size={16} />}>
            Salir
          </Button>
        </div>

        {/* Formulario: Nueva Empresa + Admin */}
        <form
          onSubmit={handleCreateTenant}
          className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-primary-light/20 space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-sand-100 pb-4">
            <Plus size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-primary-dark">Registrar Nueva Distribuidora</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                Nombre Comercial *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Distribuidora El Sol"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="field"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                Subdominio *
              </label>
              <input
                type="text"
                required
                placeholder="ej: elsol"
                value={formData.subdominio}
                onChange={(e) =>
                  setFormData({ ...formData, subdominio: e.target.value.toLowerCase().trim() })
                }
                className="field"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                WhatsApp Empresa
              </label>
              <input
                type="text"
                placeholder="549343..."
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="field"
              />
            </div>
          </div>

          <div className="border-t border-sand-100 pt-5">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">
              Credenciales del Administrador Inicial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Juan Pérez"
                  value={formData.admin_full_name}
                  onChange={(e) => setFormData({ ...formData, admin_full_name: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                  Usuario Login *
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin_elsol"
                  value={formData.admin_username}
                  onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                  className="field"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="dark" size="md" disabled={submitting} leftIcon={<Plus size={18} />}>
              {submitting ? 'Registrando...' : 'Crear Empresa y Administrador'}
            </Button>
          </div>
        </form>

        {/* Tabla de Empresas */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-sand-50 text-secondary text-xs font-bold uppercase tracking-wider border-b border-sand-100">
                <tr>
                  <th className="py-4 px-5">ID</th>
                  <th className="py-4 px-5">Distribuidora</th>
                  <th className="py-4 px-5">Subdominio</th>
                  <th className="py-4 px-5">WhatsApp</th>
                  <th className="py-4 px-5">Estado</th>
                  <th className="py-4 px-5 text-right">Control de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-secondary font-medium">
                      Cargando empresas...
                    </td>
                  </tr>
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-secondary font-medium">
                      Todavía no hay distribuidoras registradas.
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-sand-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono text-secondary font-bold">#{tenant.id}</td>
                      <td className="py-4 px-5 font-bold text-primary-dark">{tenant.nombre}</td>
                      <td className="py-4 px-5">
                        <a
                          href={`https://${tenant.subdominio}.${BASE_DOMAIN}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark font-bold inline-flex items-center gap-1.5 underline decoration-primary/40 hover:decoration-primary transition"
                        >
                          {tenant.subdominio}.{BASE_DOMAIN}
                          <ExternalLink size={14} />
                        </a>
                      </td>
                      <td className="py-4 px-5 text-secondary">{tenant.whatsapp || '-'}</td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            tenant.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {tenant.is_active ? 'Activa' : 'Suspendida'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => handleOpenEdit(tenant)}
                            title="Editar datos de la empresa"
                            leftIcon={<Pencil size={14} />}
                          >
                            Editar
                          </Button>

                          <Button
                            variant={tenant.is_active ? 'dangerSoft' : 'successSoft'}
                            size="sm"
                            onClick={() => handleToggleEstado(tenant)}
                          >
                            {tenant.is_active ? (
                              <>
                                <PowerOff size={14} /> Quitar Acceso
                              </>
                            ) : (
                              <>
                                <Power size={14} /> Habilitar Acceso
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageContent>
      {editingTenant && (
        <Modal size="lg">
          <ModalHeader title={`Editar Distribuidora #${editingTenant.id}`} onClose={() => setEditingTenant(null)} />

            <form onSubmit={handleUpdateTenant} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={editingTenant.nombre}
                  onChange={(e) => setEditingTenant({ ...editingTenant, nombre: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                  Subdominio *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={editingTenant.subdominio}
                    onChange={(e) =>
                      setEditingTenant({
                        ...editingTenant,
                        subdominio: e.target.value.toLowerCase().trim(),
                      })
                    }
                    className="field"
                  />
                  <span className="text-xs font-bold text-secondary shrink-0">.{BASE_DOMAIN}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                    WhatsApp Empresa
                  </label>
                  <input
                    type="text"
                    value={editingTenant.whatsapp}
                    onChange={(e) => setEditingTenant({ ...editingTenant, whatsapp: e.target.value })}
                    className="field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                    Color Principal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTenant.color_primario}
                      onChange={(e) =>
                        setEditingTenant({ ...editingTenant, color_primario: e.target.value })
                      }
                      className="h-10 w-12 rounded-xl border border-sand-200 cursor-pointer bg-sand-50 p-1"
                    />
                    <input
                      type="text"
                      value={editingTenant.color_primario}
                      onChange={(e) =>
                        setEditingTenant({ ...editingTenant, color_primario: e.target.value })
                      }
                      className="field font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-sand-100">
                <Button type="button" variant="ghost" size="md" onClick={() => setEditingTenant(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="dark" size="md" disabled={updating}>
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
}