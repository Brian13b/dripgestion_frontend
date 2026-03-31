import React, { createContext, useState, useEffect, useContext } from 'react';

export const TenantContext = createContext(null);

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      try {
        let hostname = window.location.hostname;
        let subdominio = hostname.split('.')[0];
        
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'dripgestion.vercel.app') {
          subdominio = import.meta.env.VITE_DEFAULT_TENANT || 'demo';
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${apiUrl}/tenants/info/${subdominio}`);

        if (!response.ok) {
          throw new Error('No se encontró la configuración para esta empresa.');
        }

        const data = await response.json();
        setTenant(data);

        document.title = `${data.nombre || 'Cargando'} - Logística`;

        const root = document.documentElement;
        
        if (data.font_sans) root.style.setProperty('--font-sans', data.font_sans);
        if (data.color_primario) root.style.setProperty('--color-primary', data.color_primario);
        if (data.color_primario_light) root.style.setProperty('--color-primary-light', data.color_primario_light);
        if (data.color_primario_dark) root.style.setProperty('--color-primary-dark', data.color_primario_dark);
        if (data.color_background) root.style.setProperty('--color-background', data.color_background);
        if (data.color_success) root.style.setProperty('--color-success', data.color_success);
        if (data.color_danger) root.style.setProperty('--color-danger', data.color_danger);
        if (data.color_secondary) root.style.setProperty('--color-secondary', data.color_secondary);

      } catch (err) {
        console.error("Error cargando Tenant:", err);
        setError('Acceso denegado o empresa inactiva.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">DripGestión</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl text-center border border-red-50">
        <h1 className="text-4xl font-black text-slate-800 mb-3">DripGestión</h1>
        <p className="text-slate-500 font-medium italic">{error}</p>
      </div>
    </div>
  );

  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
};