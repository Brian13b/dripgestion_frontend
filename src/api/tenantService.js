import api from './axios';

export const tenantService = {
  
  // Actualizar la configuración de la empresa
  updateConfig: async (configData) => {
    const response = await api.put('/tenants/config', configData);
    return response.data;
  }
};