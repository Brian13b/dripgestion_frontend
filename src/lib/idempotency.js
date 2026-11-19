/**
 * Clave de idempotencia para operaciones que mueven plata o envases (entregas, cobros).
 * Se envía en el header `Idempotency-Key`: si la petición se reintenta (mala señal, doble
 * toque) con LA MISMA clave, el servidor no la registra dos veces.
 * Regla: una clave por intento de guardado; se reutiliza al reintentar sin cambios y se
 * descarta cuando el guardado sale bien o cuando el usuario edita los datos.
 */
export const nuevaClaveIdempotencia = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Respaldo para contextos sin crypto.randomUUID (HTTP sin TLS, navegadores viejos)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export const headersIdempotencia = (clave) => (clave ? { headers: { 'Idempotency-Key': clave } } : undefined);
