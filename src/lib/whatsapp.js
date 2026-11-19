/**
 * Enlace de WhatsApp de la empresa. Si la empresa no cargo un numero (o no tiene digitos
 * suficientes) devuelve null: la pantalla NO debe mostrar un enlace a un numero inventado.
 */
export const urlWhatsapp = (numero, mensaje = '') => {
  const digitos = String(numero ?? '').replace(/\D/g, '');
  if (digitos.length < 8) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
};
