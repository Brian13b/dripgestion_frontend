import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { ArrowLeft, Store, Palette, Shield, Save, Image as ImageIcon, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantService } from '../../api/tenantService';
import { authService } from '../../api/authService'

export const ConfiguracionView = () => {
  const navigate = useNavigate();
  const tenant = useTenant();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: tenant?.nombre || '',
    whatsapp: tenant?.whatsapp || '',
    font_sans: tenant?.font_sans || "'Inter', sans-serif",
    color_primario: tenant?.color_primario || '#25A7DA',
    color_primario_light: tenant?.color_primario_light || '#00ACC1',
    color_primario_dark: tenant?.color_primario_dark || '#0C4A6E',
    color_background: tenant?.color_background || '#F0FDFA',
    color_success: tenant?.color_success || '#10b981',
    color_danger: tenant?.color_danger || '#ef4444',
    color_secondary: tenant?.color_secondary || '#64748b',
  });

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, seleccioná un archivo de imagen válido');
      return;
    }

    setIsUploadingLogo(true);
    try {
      await tenantService.uploadLogo(file);
      toast.success('Logo actualizado con éxito');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error(error);
      toast.error('Error al subir el logo a la nube');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      await tenantService.updateConfig(formData);
      toast.success('Configuración guardada exitosamente');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'Perfil Empresa', icon: Store },
    { id: 'apariencia', name: 'Apariencia & Logo', icon: Palette },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
  ];

  const coloresConfig = [
    { key: 'color_primario', label: 'Primario (Botones y Navbar)' },
    { key: 'color_primario_light', label: 'Primario Claro (Detalles)' },
    { key: 'color_primario_dark', label: 'Primario Oscuro (Textos Titulares)' },
    { key: 'color_background', label: 'Fondo General (Background)' },
    { key: 'color_success', label: 'Éxito (Verde)' },
    { key: 'color_danger', label: 'Peligro (Rojo)' },
    { key: 'color_secondary', label: 'Secundario (Gris)' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      
      {/* HEADER */}
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-5">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="hover:bg-white/20 bg-white/5 p-3 rounded-full transition-colors mr-4 shadow-sm backdrop-blur-sm shrink-0">
              <ArrowLeft size={28} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Configuración</h1>
              <p className="text-primary-light text-xs md:text-sm font-bold mt-1 tracking-widest uppercase opacity-90">Ajustes del Sistema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 flex flex-col md:flex-row gap-6 md:gap-8">        
        {/* ASIDE */}
        <div className="md:w-1/3 lg:w-1/4 shrink-0">
          <div className="bg-white p-3 rounded-3xl shadow-sm border border-primary-light/20 flex md:flex-col overflow-x-auto hide-scrollbar space-x-2 md:space-x-0 md:space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 md:py-5 rounded-2xl font-bold transition-all shrink-0 md:shrink border-2 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-inner' 
                      : 'text-secondary border-transparent hover:bg-slate-50 hover:text-primary-dark'
                  }`}
                >
                  <Icon size={22} className={`mr-3 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span className="tracking-wide text-sm md:text-base">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-primary-light/20">          
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-primary-dark border-b border-primary-light/20 pb-4 flex items-center"><Store className="mr-3 text-primary"/> Datos de la Empresa</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Nombre Público</label>
                  <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-bold text-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Número de WhatsApp (Pedidor)</label>
                  <input type="text" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="Ej: 5491123456789" className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-bold text-lg outline-none" />
                  <p className="text-xs text-secondary mt-2 italic">* El número a donde los clientes enviarán sus pedidos.</p>
                </div>
              </div>
            </div>
          )}

          {/* APARIENCIA */}
          {activeTab === 'apariencia' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-primary-dark border-b border-primary-light/20 pb-4 flex items-center"><Palette className="mr-3 text-primary"/> Branding Visual</h2>
              
              <div className="p-5 bg-slate-50 border border-primary-light/30 rounded-3xl flex flex-col md:flex-row items-center gap-6 max-w-xl">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-primary-light/20 overflow-hidden shrink-0">
                  {tenant?.logo_url ? <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-contain p-2"/> : <ImageIcon size={32} className="text-slate-300"/>}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="font-bold text-primary-dark mb-1 tracking-wide">Logo de la App</p>
                  <p className="text-sm text-secondary mb-3">Se mostrará en el login y en el portal del cliente.</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploadingLogo}
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUploadingLogo ? 'Subiendo...' : 'Subir Nueva Imagen'}
                  </button>
                </div>
              </div>

              <div className="max-w-xl">
                <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-3 flex items-center"><Type size={18} className="mr-2"/> Tipografía Principal</label>
                <select 
                  value={formData.font_sans} 
                  onChange={(e) => setFormData({...formData, font_sans: e.target.value})} 
                  className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-bold text-lg outline-none cursor-pointer"
                >
                  <option value="'Inter', sans-serif">Inter (Moderna y Limpia)</option>
                  <option value="'Poppins', sans-serif">Poppins (Redondeada y Amigable)</option>
                  <option value="'Roboto', sans-serif">Roboto (Corporativa y Clásica)</option>
                  <option value="'Nunito', sans-serif">Nunito (Suave y Atractiva)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-primary-light/20 pb-2">Paleta de Colores</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                  {coloresConfig.map((color) => (
                    <div key={color.key} className="bg-slate-50 p-3 rounded-2xl border border-primary-light/20">
                      <label className="block text-xs font-bold text-secondary mb-2">{color.label}</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={formData[color.key]} 
                          onChange={(e) => setFormData({...formData, [color.key]: e.target.value})} 
                          className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={formData[color.key]} 
                          onChange={(e) => setFormData({...formData, [color.key]: e.target.value})} 
                          className="flex-1 p-2.5 rounded-xl border border-primary-light/30 focus:border-primary text-primary-dark font-bold outline-none uppercase text-sm" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-primary-dark border-b border-primary-light/20 pb-4 flex items-center"><Shield className="mr-3 text-primary"/> Seguridad de Cuenta</h2>
              
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Contraseña Actual</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Tu contraseña actual" 
                    className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-black tracking-widest text-lg outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" 
                    className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-black tracking-widest text-lg outline-none" 
                  />
                </div>
                
                <button 
                  onClick={async () => {
                    if(!currentPassword || !newPassword) return toast.error("Completá ambos campos");
                    try {
                      await authService.changePassword(currentPassword, newPassword);
                      toast.success("Contraseña actualizada con éxito");
                      setCurrentPassword('');
                      setNewPassword('');
                    } catch (error) {
                      toast.error("Contraseña actual incorrecta");
                    }
                  }}
                  className="mt-2 bg-primary-dark hover:bg-primary text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          )}

          {/* BOTÓN GUARDAR */}
          <div className="mt-10 pt-6 border-t border-primary-light/20 flex justify-end">
            <button 
              onClick={handleGuardar} 
              disabled={isSaving}
              className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 text-lg flex items-center justify-center tracking-wide disabled:opacity-70"
            >
              {isSaving ? 'Guardando...' : <><Save size={24} className="mr-2" /> Guardar Cambios</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};