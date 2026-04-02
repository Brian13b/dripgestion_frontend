import api from '../api/axios';

export const recorridoService = {
  // Traer todos los recorridos
  getAll: async () => {
    const response = await api.get('/logistica/recorridos');
    return response.data;
  },
  
  // Traer un recorrido específico
  getById: async (id) => {
    const response = await api.get(`/logistica/recorridos/${id}`);
    return response.data;
  },
  
  // Crear un nuevo recorrido
  create: async (data) => {
    const response = await api.post('/logistica/recorridos', data);
    return response.data;
  },
  
  // Actualizar recorrido
  update: async (id, data) => {
    const response = await api.put(`/logistica/recorridos/${id}`, data);
    return response.data;
  },
  
  // Registrar una entrega / movimiento
  registrarMovimiento: async (data) => {
    const response = await api.post('/logistica/movimientos', data);
    return response.data;
  },

  // Historial por dia
  getHistorialPorFecha: async (fecha, choferId, recorridoId) => {
    const params = new URLSearchParams();
    if (fecha) params.append('fecha', fecha);
    if (choferId) params.append('chofer_id', choferId);
    if (recorridoId) params.append('recorrido_id', recorridoId);

    const response = await api.get(`/logistica/historial?${params.toString()}`);
    return response.data;
  },

  // Historial por mes
  getResumenMesActual: async () => {
    const response = await api.get('/logistica/historial/mes-actual');
    return response.data;
  },
};