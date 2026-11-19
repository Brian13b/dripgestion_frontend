/** Fechas en hora LOCAL del navegador (YYYY-MM-DD), sin pasar por UTC. */
const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d, n) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

export const addMonths = (d, n) => {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const ultimo = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(d.getDate(), ultimo));
  return x;
};

/** Lunes de la semana de `d` (la semana operativa empieza el lunes, igual que el backend: lunes = 0). */
export const inicioDeSemana = (d) => addDays(d, -((d.getDay() + 6) % 7));

export const inicioDeMes = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Día de la semana al estilo del backend: 0 = lunes … 6 = domingo. */
export const diaSemanaApi = (d) => (d.getDay() + 6) % 7;

export const mismoDia = (a, b) => toISO(a) === toISO(b);

export const hhmm = (t) => String(t ?? '').slice(0, 5);

export const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const formatear = (d, opciones) => d.toLocaleDateString('es-AR', opciones);
