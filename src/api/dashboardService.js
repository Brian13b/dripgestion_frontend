import api from './axios';

export const dashboardService = {
  // params opcionales: { mes_a, anio_a, mes_b, anio_b } (comparativo de meses)
  getResumen: async (params) => {
    const response = await api.get('/dashboard/resumen', { params });
    return response.data;
  },
};
