import api from './axios';
import { headersIdempotencia } from '../lib/idempotency';

export const clientesService = {
  // Traer todos
  // El backend pagina (limit=100 por defecto): se recorren todas las paginas para no
  // dejar clientes afuera de la lista, del recorrido ni de la visita excepcional.
  getAll: async () => {
    const PAGE = 100;
    const items = [];
    for (let skip = 0, total = Infinity; skip < total; skip += PAGE) {
      const { data } = await api.get('/clientes', { params: { skip, limit: PAGE } });
      items.push(...(data.items || []));
      total = data.total ?? items.length;
      if (!data.items?.length) break;
    }
    return items;
  },
  
  // Traer uno solo
  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
  
  // Crear
  create: async (data) => {
    const response = await api.post('/clientes', data);
    return response.data;
  },
  
  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },
  
  // Eliminar
  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
  
  // Registrar pago
  registrarPago: async (id, data, idempotencyKey) => {
    const response = await api.post(`/logistica/movimientos/pago/${id}`, data, headersIdempotencia(idempotencyKey));
    return response.data;
  }
};