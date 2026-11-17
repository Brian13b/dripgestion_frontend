import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { ShieldCheck, LogOut, Building2, Plus, Power, PowerOff, ExternalLink, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
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
      toast.success(`Datos de "${data.nombre}" actualizados.`);
      setEditingTenant(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al actualizar la distribuidora.');
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
      toast.error('Error al cargar las distribuidoras.');
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
      toast.success(`Distribuidora "${formData.nombre}" creada con éxito.`);
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
      toast.error(err.response?.data?.detail || 'Error al registrar la empresa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (tenant) => {
    const nuevoEstado = !tenant.is_active;
    const accion = nuevoEstado ? 'habilitar' : 'suspender';
    if (!window.confirm(`¿Seguro que querés ${accion} el acceso a ${tenant.nombre}?`)) return;

    try {
      await api.patch(`/tenants/${tenant.id}/estado?activo=${nuevoEstado}`);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, is_active: nuevoEstado } : t))
      );
      toast.success(`Acceso ${nuevoEstado ? 'habilitado' : 'suspendido'} para ${tenant.nombre}`);
    } catch (err) {
      toast.error('No se pudo actualizar el estado de la empresa.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 font-sans">
      <div className="bg-primary-dark px-5 md:px-12 lg:px-20 pt-10 pb-8 md:pb-12 mb-8 shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center text-primary font-black text-2xl md:text-3xl tracking-tight mb-2">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center mr-3 shrink-0 shadow-sm">
                <ShieldCheck size={24} className="text-primary" />
              </div>
              <span>Panel SuperAdmin — Drip Gestión</span>
            </div>
            <p className="text-white/90 font-medium text-sm md:text-base">
              Hola, {user?.full_name || 'Administrador'}. Gestioná las distribuidoras y sus accesos.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="px-3.5 py-2 bg-white/10 text-white text-xs font-bold rounded-2xl border border-white/20 flex items-center gap-2">
              <Building2 size={16} className="text-primary-light" />
              {tenants.length} Empresas
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-danger/90 hover:bg-danger text-white text-sm font-bold rounded-2xl transition flex items-center gap-2 shadow-sm active:scale-95"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-12 lg:px-20 max-w-6xl mx-auto space-y-8">
        {/* Formulario: Nueva Empresa + Admin */}
        <form
          onSubmit={handleCreateTenant}
          className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-primary-light/20 space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
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
                className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
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
                  className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                  className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                  className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-dark hover:bg-primary text-white font-bold px-6 py-3 rounded-2xl text-sm transition shadow-md active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              <Plus size={18} />
              {submitting ? 'Registrando...' : 'Crear Empresa y Administrador'}
            </button>
          </div>
        </form>

        {/* Tabla de Empresas */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-light/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-secondary text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-5">ID</th>
                  <th className="py-4 px-5">Distribuidora</th>
                  <th className="py-4 px-5">Subdominio</th>
                  <th className="py-4 px-5">WhatsApp</th>
                  <th className="py-4 px-5">Estado</th>
                  <th className="py-4 px-5 text-right">Control de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
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
                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
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
                          <button
                            onClick={() => handleOpenEdit(tenant)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition inline-flex items-center gap-1.5"
                            title="Editar datos de la empresa"
                          >
                            <Pencil size={14} /> Editar
                          </button>

                          <button
                            onClick={() => handleToggleEstado(tenant)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                              tenant.is_active
                                ? 'bg-danger/10 text-danger hover:bg-danger/20'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
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
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-primary-light/20 overflow-hidden">
            <div className="bg-primary-dark px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold">
                <Pencil size={18} className="text-primary-light" />
                <span>Editar Distribuidora #{editingTenant.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary-dark uppercase tracking-wider mb-1.5">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={editingTenant.nombre}
                  onChange={(e) => setEditingTenant({ ...editingTenant, nombre: e.target.value })}
                  className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                    className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                    className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-4 py-2.5 text-sm bg-slate-50 font-medium"
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
                      className="h-10 w-12 rounded-xl border border-slate-200 cursor-pointer bg-slate-50 p-1"
                    />
                    <input
                      type="text"
                      value={editingTenant.color_primario}
                      onChange={(e) =>
                        setEditingTenant({ ...editingTenant, color_primario: e.target.value })
                      }
                      className="w-full border-2 border-primary-light/30 focus:border-primary focus:ring-0 rounded-2xl px-3 py-2 text-sm bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-bold text-secondary hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-primary-dark hover:bg-primary text-white font-bold px-5 py-2.5 rounded-2xl text-sm transition shadow-sm active:scale-95 disabled:opacity-60"
                >
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}