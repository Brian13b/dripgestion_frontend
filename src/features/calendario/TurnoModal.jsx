import { useMemo, useState } from 'react';
import { Plus, Trash2, Truck, PackageOpen, CalendarRange } from 'lucide-react';
import { Modal, ModalHeader, ModalFooter } from '../../components/primitives/Modal';
import { Button } from '../../components/primitives/Button';
import { useConfirm } from '../../components/primitives/ConfirmContext';
import { turnoService } from '../../api/turnoService';
import { notify } from '../../lib/notify';
import {
  DIAS_CORTOS, DIAS_LARGOS, addDays, addMonths, diaSemanaApi, formatear, fromISO, hhmm, toISO,
} from '../../lib/fechas';

const MAX_AYUDANTES = 2; // 1 conductor + hasta 2 que descargan = 3 repartidores

const Etiqueta = ({ children }) => (
  <label className="block text-xs font-bold text-secondary uppercase mb-2 ml-1 tracking-widest">{children}</label>
);

/**
 * Modal del calendario.
 *  modo 'turno'     → crear (turno === null) o editar un turno de un día concreto.
 *  modo 'programar' → crear turnos en lote para los próximos meses.
 */
export const TurnoModal = ({ modo, turno = null, fechaInicial, recorridos, repartidores, onClose, onSaved }) => {
  const confirm = useConfirm();
  const editando = Boolean(turno);
  const hoy = toISO(new Date());

  const conductorInicial = turno?.repartidores.find((r) => r.rol === 'conductor')?.user_id ?? '';
  const ayudantesIniciales = turno ? turno.repartidores.filter((r) => r.rol === 'ayudante').map((r) => r.user_id) : [];

  const [recorridoId, setRecorridoId] = useState(turno?.recorrido_id ?? recorridos[0]?.id ?? '');
  const [fecha, setFecha] = useState(turno?.fecha ?? fechaInicial ?? hoy);
  const [desde, setDesde] = useState(fechaInicial && fechaInicial > hoy ? fechaInicial : hoy);
  const [hasta, setHasta] = useState(toISO(addDays(addMonths(new Date(), 3), -1)));
  const [dias, setDias] = useState(() => {
    const r = recorridos[0];
    return r && Number.isInteger(r.dia_semana) ? [r.dia_semana] : [];
  });
  const [horaDesde, setHoraDesde] = useState(turno ? hhmm(turno.hora_desde) : '08:00');
  const [horaHasta, setHoraHasta] = useState(turno ? hhmm(turno.hora_hasta) : '12:00');
  const [conductor, setConductor] = useState(conductorInicial);
  const [ayudantes, setAyudantes] = useState(ayudantesIniciales);
  const [nota, setNota] = useState(turno?.nota ?? '');
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);

  const elegidos = useMemo(() => [conductor, ...ayudantes].filter((v) => v !== ''), [conductor, ayudantes]);
  const disponibles = (actual) => repartidores.filter((r) => r.id === actual || !elegidos.includes(r.id));

  const cantidadAProgramar = useMemo(() => {
    if (modo !== 'programar' || !desde || !hasta || hasta < desde) return 0;
    let n = 0;
    for (let d = fromISO(desde); toISO(d) <= hasta; d = addDays(d, 1)) {
      if (dias.includes(diaSemanaApi(d))) n += 1;
    }
    return n;
  }, [modo, desde, hasta, dias]);

  const elegirRecorrido = (id) => {
    setRecorridoId(id);
    const r = recorridos.find((x) => x.id === Number(id));
    if (modo === 'programar' && r && Number.isInteger(r.dia_semana)) setDias([r.dia_semana]);
  };

  const alternarDia = (d) => setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const equipoPayload = () => [
    { user_id: Number(conductor), rol: 'conductor' },
    ...ayudantes.filter((a) => a !== '').map((a) => ({ user_id: Number(a), rol: 'ayudante' })),
  ];

  const validar = () => {
    if (!recorridoId) return 'Elegí una ruta';
    if (conductor === '') return 'Elegí quién conduce';
    if (ayudantes.some((a) => a === '')) return 'Completá o quitá el ayudante vacío';
    if (!horaDesde || !horaHasta || horaDesde >= horaHasta) return 'La hora de inicio debe ser anterior a la de fin';
    if (modo === 'programar') {
      if (!desde || !hasta || hasta < desde) return 'El rango de fechas no es válido';
      if (dias.length === 0) return 'Elegí al menos un día de la semana';
      if (cantidadAProgramar === 0) return 'Ningún día del rango coincide con los días elegidos';
    } else if (!fecha) {
      return 'Elegí la fecha';
    }
    return null;
  };

  const guardar = async () => {
    const error = validar();
    if (error) return notify.error(error);
    setSaving(true);
    try {
      const comunes = { hora_desde: horaDesde, hora_hasta: horaHasta, repartidores: equipoPayload(), nota: nota.trim() || null };
      if (modo === 'programar') {
        const res = await turnoService.programar({
          ...comunes, recorrido_id: Number(recorridoId), fecha_desde: desde, fecha_hasta: hasta, dias_semana: dias,
        });
        notify.success(`Se programaron ${res.creados} turno${res.creados === 1 ? '' : 's'}`);
        onSaved();
        if (res.omitidos.length > 0) setResultado(res);
        else onClose();
      } else if (editando) {
        await turnoService.actualizar(turno.id, comunes);
        notify.success('Turno actualizado');
        onSaved();
        onClose();
      } else {
        await turnoService.crear({ ...comunes, recorrido_id: Number(recorridoId), fecha });
        notify.success('Turno creado');
        onSaved();
        onClose();
      }
    } catch (e) {
      notify.error(e, 'No se pudo guardar el turno');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async () => {
    const ok = await confirm({
      title: 'Eliminar turno',
      message: `Se quita "${turno.recorrido_nombre}" del ${formatear(fromISO(turno.fecha), { day: 'numeric', month: 'long' })}.`,
      confirmLabel: 'Eliminar',
    });
    if (!ok) return;
    try {
      await turnoService.eliminar(turno.id);
      notify.success('Turno eliminado');
      onSaved();
      onClose();
    } catch (e) {
      notify.error(e, 'No se pudo eliminar el turno');
    }
  };

  if (resultado) {
    return (
      <Modal onClose={onClose}>
        <ModalHeader title="Programación lista" onClose={onClose} />
        <div className="p-6 overflow-y-auto space-y-3">
          <p className="font-bold text-primary-dark">
            {resultado.creados} turno{resultado.creados === 1 ? '' : 's'} creado{resultado.creados === 1 ? '' : 's'}.
          </p>
          <p className="text-sm text-secondary font-medium">
            {resultado.omitidos.length} día{resultado.omitidos.length === 1 ? '' : 's'} se omitieron porque ya estaban ocupados:
          </p>
          <ul className="space-y-1.5 text-sm">
            {resultado.omitidos.map((o) => (
              <li key={o.fecha} className="bg-sand-50 border border-sand-100 rounded-xl px-3 py-2">
                <span className="font-bold text-primary-dark">{formatear(fromISO(o.fecha), { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="text-secondary"> — {o.motivo}</span>
              </li>
            ))}
          </ul>
        </div>
        <ModalFooter>
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>Listo</Button>
        </ModalFooter>
      </Modal>
    );
  }

  const titulo = modo === 'programar' ? 'Programar turnos' : editando ? 'Editar turno' : 'Nuevo turno';

  return (
    <Modal tall sheet onClose={onClose}>
      <ModalHeader
        title={titulo}
        subtitle={modo === 'programar' ? 'Repetí una ruta durante los próximos meses' : undefined}
        onClose={onClose}
      />

      <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-5">
        <div>
          <Etiqueta>Ruta</Etiqueta>
          <select className="field cursor-pointer" value={recorridoId} disabled={editando} onChange={(e) => elegirRecorrido(e.target.value)}>
            {recorridos.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre} · {DIAS_LARGOS[r.dia_semana] ?? ''}</option>
            ))}
          </select>
        </div>

        {modo === 'programar' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Etiqueta>Desde</Etiqueta>
                <input type="date" className="field" min={hoy} value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div>
                <Etiqueta>Hasta</Etiqueta>
                <input type="date" className="field" min={desde} value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 -mt-2">
              {[1, 3, 6, 12].map((m) => (
                <Button
                  key={m} size="sm" variant="secondary" type="button"
                  onClick={() => setHasta(toISO(addDays(addMonths(fromISO(desde), m), -1)))}
                >
                  {m === 12 ? '1 año' : `${m} ${m === 1 ? 'mes' : 'meses'}`}
                </Button>
              ))}
            </div>
            <div>
              <Etiqueta>Días de salida</Etiqueta>
              <div className="flex gap-1.5">
                {DIAS_CORTOS.map((letra, i) => {
                  const activo = dias.includes(i);
                  return (
                    <button
                      key={i} type="button" title={DIAS_LARGOS[i]} aria-pressed={activo} onClick={() => alternarDia(i)}
                      className={`h-11 flex-1 rounded-xl font-bold text-sm cursor-pointer transition-colors ${
                        activo ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'bg-sand-100 text-secondary hover:bg-sand-200/60'
                      }`}
                    >
                      {letra}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div>
            <Etiqueta>Fecha</Etiqueta>
            <input type="date" className="field" value={fecha} disabled={editando} onChange={(e) => setFecha(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Etiqueta>Sale a las</Etiqueta>
            <input type="time" className="field" value={horaDesde} onChange={(e) => setHoraDesde(e.target.value)} />
          </div>
          <div>
            <Etiqueta>Vuelve a las</Etiqueta>
            <input type="time" className="field" value={horaHasta} onChange={(e) => setHoraHasta(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <Etiqueta>Repartidores (1 a 3)</Etiqueta>
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-primary shrink-0" aria-label="Conductor" />
            <select className="field cursor-pointer" value={conductor} onChange={(e) => setConductor(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">Quién conduce…</option>
              {disponibles(conductor).map((r) => <option key={r.id} value={r.id}>{r.full_name || r.username}</option>)}
            </select>
          </div>
          {ayudantes.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <PackageOpen size={20} className="text-secondary shrink-0" aria-label="Ayudante de descarga" />
              <select
                className="field cursor-pointer" value={a}
                onChange={(e) => setAyudantes(ayudantes.map((x, j) => (j === i ? (e.target.value === '' ? '' : Number(e.target.value)) : x)))}
              >
                <option value="">Ayuda a descargar…</option>
                {disponibles(a).map((r) => <option key={r.id} value={r.id}>{r.full_name || r.username}</option>)}
              </select>
              <Button type="button" variant="dangerSoft" size="md" iconOnly aria-label="Quitar ayudante" onClick={() => setAyudantes(ayudantes.filter((_, j) => j !== i))}>
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          {ayudantes.length < MAX_AYUDANTES && (
            <Button type="button" variant="soft" size="sm" onClick={() => setAyudantes([...ayudantes, ''])}>
              <Plus size={16} /> Agregar quien descarga
            </Button>
          )}
          {repartidores.length === 0 && (
            <p className="text-sm text-secondary font-medium">No hay repartidores activos. Cargalos desde Equipo.</p>
          )}
        </div>

        <div>
          <Etiqueta>Nota (opcional)</Etiqueta>
          <input type="text" maxLength={200} className="field" placeholder="Ej. camión 2, reparto de hielo" value={nota} onChange={(e) => setNota(e.target.value)} />
        </div>

        {modo === 'programar' && (
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-dark bg-sand-50 border border-sand-100 rounded-2xl px-4 py-3">
            <CalendarRange size={18} className="text-primary shrink-0" />
            {cantidadAProgramar === 0 ? 'No se crearía ningún turno' : `Se crearán hasta ${cantidadAProgramar} turno${cantidadAProgramar === 1 ? '' : 's'}`}
            <span className="text-secondary font-medium">(los días ya ocupados se omiten)</span>
          </p>
        )}
      </div>

      <ModalFooter className="flex gap-3">
        {editando && (
          <Button variant="dangerSoft" size="lg" iconOnly aria-label="Eliminar turno" onClick={eliminar}>
            <Trash2 size={20} />
          </Button>
        )}
        <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={guardar}>
          {saving ? 'Guardando...' : modo === 'programar' ? 'Programar' : 'Guardar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
