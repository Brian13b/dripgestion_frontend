import api from './axios';

// Calendario operativo: cada turno es "esta ruta sale este día, de X a Y, con 1 a 3 repartidores".
export const turnoService = {
  // desde / hasta: 'YYYY-MM-DD' (máx. 93 días). El repartidor recibe solo sus turnos.
  listar: async (desde, hasta, filtros = {}) => {
    const response = await api.get('/logistica/turnos', { params: { desde, hasta, ...filtros } });
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/logistica/turnos', data);
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/logistica/turnos/${id}`, data);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.delete(`/logistica/turnos/${id}`);
    return response.data;
  },

  // Programa en lote (p. ej. los próximos meses). Devuelve { creados, omitidos: [{ fecha, motivo }] }.
  programar: async (data) => {
    const response = await api.post('/logistica/turnos/programar', data);
    return response.data;
  },

  // Deshace una programación: borra los turnos futuros de una ruta entre dos fechas.
  eliminarRango: async (recorridoId, desde, hasta) => {
    const response = await api.delete('/logistica/turnos', {
      params: { recorrido_id: recorridoId, desde, hasta },
    });
    return response.data;
  },
};
