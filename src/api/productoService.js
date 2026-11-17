import api from '../api/axios';

export const productosService = {
  // --- PRODUCTOS ---
  getAll: async () => {
    const response = await api.get('/productos');
    return response.data;
  },

  create: async (productoData) => {
    const response = await api.post('/productos', productoData);
    return response.data;
  },

  update: async (id, productoData) => {
    const response = await api.put(`/productos/${id}`, productoData);
    return response.data;
  },

  updatePrecio: async (id, nuevoPrecio) => {
    const response = await api.put(`/productos/${id}`, {
      precio_actual: parseFloat(nuevoPrecio),
    });
    return response.data;
  },

  toggleActivo: async (id) => {
    const response = await api.put(`/productos/${id}/toggle`);
    return response.data;
  },

  // --- TIPOS DE ENVASE ---
  getTiposEnvase: async (soloActivos = false) => {
    const response = await api.get('/productos/tipos-envase', {
      params: { solo_activos: soloActivos },
    });
    return response.data;
  },

  createTipoEnvase: async (envaseData) => {
    const response = await api.post('/productos/tipos-envase', envaseData);
    return response.data;
  },

  updateTipoEnvase: async (id, envaseData) => {
    const response = await api.put(`/productos/tipos-envase/${id}`, envaseData);
    return response.data;
  },

  toggleTipoEnvase: async (id) => {
    const response = await api.put(`/productos/tipos-envase/${id}/toggle`);
    return response.data;
  },
};