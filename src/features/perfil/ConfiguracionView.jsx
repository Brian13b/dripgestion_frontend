import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { ArrowLeft, Store, Palette, Shield, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const ConfiguracionView = () => {
  const navigate = useNavigate();
  const tenant = useTenant();
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    nombre: tenant?.nombre || '',
    whatsapp: tenant?.whatsapp || '',
    colorPrimario: tenant?.color_primario || '#2563eb',
  });

  const handleGuardar = () => {
    toast.success('Configuración guardada exitosamente');
  };

  const tabs = [
    { id: 'general', name: 'Perfil Empresa', icon: Store },
    { id: 'apariencia', name: 'Apariencia & Logo', icon: Palette },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      
      {/* HEADER ISLA */}
      <div className="sticky top-0 z-20 pt-4 md:pt-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-primary-dark text-white p-5 md:px-10 md:py-6 rounded-[2rem] shadow-2xl border-b-4 border-primary flex justify-between items-center transition-all">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="hover:bg-white/20 bg-white/5 p-3 rounded-full transition-colors mr-4 shadow-sm backdrop-blur-sm">
              <ArrowLeft size={28} />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-wide">Configuración</h1>
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
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-primary-dark border-b border-primary-light/20 pb-4 flex items-center"><Palette className="mr-3 text-primary"/> Branding Visual</h2>
              
              <div className="p-5 bg-slate-50 border border-primary-light/30 rounded-3xl flex flex-col md:flex-row items-center gap-6 max-w-xl">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-primary-light/20 overflow-hidden shrink-0">
                  {tenant?.logo_url ? <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-contain p-2"/> : <ImageIcon size={32} className="text-slate-300"/>}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="font-bold text-primary-dark mb-1 tracking-wide">Logo de la App</p>
                  <p className="text-sm text-secondary mb-3">Se mostrará en el login y en el portal del cliente.</p>
                  <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm">Subir Nueva Imagen</button>
                </div>
              </div>

              <div className="max-w-lg mt-6">
                <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-3">Color Primario</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={formData.colorPrimario} onChange={(e) => setFormData({...formData, colorPrimario: e.target.value})} className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0" />
                  <input type="text" value={formData.colorPrimario} onChange={(e) => setFormData({...formData, colorPrimario: e.target.value})} className="flex-1 p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-bold text-lg outline-none uppercase" />
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
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Nueva Contraseña</label>
                  <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-black tracking-widest text-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Repetir Contraseña</label>
                  <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-primary-dark font-black tracking-widest text-lg outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN GUARDAR */}
          <div className="mt-10 pt-6 border-t border-primary-light/20 flex justify-end">
            <button onClick={handleGuardar} className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 text-lg flex items-center justify-center tracking-wide">
              <Save size={24} className="mr-2" /> Guardar Cambios
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};