import toast from 'react-hot-toast';

/**
 * Normaliza cualquier error de la API (FastAPI devuelve `detail` como string,
 * lista de errores de validación u objeto) a un texto seguro para mostrar.
 */
export const getErrorMessage = (error, fallback = 'Ocurrió un error') => {
  if (typeof error === 'string') return error;
  const detail = error?.response?.data?.detail;
  if (!detail) {
    if (error && !error.response && error.request) return 'Sin conexión con el servidor';
    return fallback;
  }
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const text = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : '';
        return field ? `${field}: ${item.msg}` : item?.msg || '';
      })
      .filter(Boolean)
      .join(' | ');
    return text || fallback;
  }
  if (typeof detail === 'object') return detail.msg || detail.message || fallback;
  return fallback;
};

// El id = mensaje: si el mismo aviso se dispara dos veces, no se apila.
export const notify = {
  success: (message) => toast.success(String(message), { id: `s:${message}` }),
  error: (errorOrMessage, fallback) => {
    const message = getErrorMessage(errorOrMessage, fallback);
    return toast.error(message, { id: `e:${message}` });
  },
  info: (message) => toast(String(message), { id: `i:${message}` }),
};
