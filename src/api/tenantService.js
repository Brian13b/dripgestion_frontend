import api from './axios';

export const tenantService = {
  // --- Superadmin ---
  listar: async () => {
    const response = await api.get('/tenants/');
    return response.data;
  },

  crearConAdmin: async (data) => {
    const response = await api.post('/tenants/onboarding', data);
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id, activo) => {
    const response = await api.patch(`/tenants/${id}/estado`, null, { params: { activo } });
    return response.data;
  },

  // --- Admin de la empresa ---
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