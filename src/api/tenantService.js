import api from './axios';

export const tenantService = {
  
  updateConfig: async (configData) => {
    const response = await api.put('/tenants/config', configData);
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/tenants/config/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};