import api from '../api/axios';
import { headersIdempotencia } from '../lib/idempotency';

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
  
  // Eliminar recorrido
  delete: async (id) => {
    const response = await api.delete(`/logistica/recorridos/${id}`);
    return response.data;
  },

  // Actualizar recorrido
  update: async (id, data) => {
    const response = await api.put(`/logistica/recorridos/${id}`, data);
    return response.data;
  },
  
  // Chofer habitual de la ruta (null = sin chofer habitual)
  asignarRepartidor: async (id, repartidorId) => {
    const response = await api.patch(`/logistica/recorridos/${id}/asignar-repartidor`, { repartidor_id: repartidorId });
    return response.data;
  },

  // Registrar una entrega / movimiento
  registrarMovimiento: async (data, idempotencyKey) => {
    const response = await api.post('/logistica/movimientos', data, headersIdempotencia(idempotencyKey));
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