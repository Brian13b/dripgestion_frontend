import { useEffect, useRef, useState } from 'react';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { Modal, ModalHeader, ModalFooter } from '../../components/primitives/Modal';
import { Button } from '../../components/primitives/Button';
import { X, Banknote, CreditCard } from 'lucide-react';
import { notify } from '../../lib/notify';
import { clientesService } from '../../api/clienteService';
import { nuevaClaveIdempotencia } from '../../lib/idempotency';

export const CobroModal = ({ isOpen, onClose, cliente, onSuccess }) => {
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('transferencia');
  const [loading, setLoading] = useState(false);

  // Un reintento del mismo cobro (sin cambios) no se descuenta dos veces.
  const claveEnvioRef = useRef(null);
  useEffect(() => {
    claveEnvioRef.current = null;
  }, [monto, metodo, cliente?.id]);

  if (!isOpen || !cliente) return null;

  const handleCobrar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!claveEnvioRef.current) claveEnvioRef.current = nuevaClaveIdempotencia();
      await clientesService.registrarPago(
        cliente.id,
        { monto: parseFloat(monto), metodo_pago: metodo, observacion: '' },
        claveEnvioRef.current,
      );
      claveEnvioRef.current = null;
      notify.success('Pago registrado con éxito');
      setMonto('');
      onSuccess();
      onClose();
    } catch (error) {
      notify.error(error, 'Error al registrar el pago');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
        <ModalHeader title="Registrar Pago" onClose={onClose} />

        <div className="overflow-y-auto p-6">
          <form id="cobro-form" onSubmit={handleCobrar} className="space-y-5">
            <div>
              <p className="text-sm text-secondary">Cliente</p>
              <p className="font-bold text-primary-dark">
                {cliente.nombre_negocio}
              </p>
              <div className="mt-2 inline-block bg-background px-3 py-1 rounded-full text-sm">
                Saldo actual:{' '}
                <span
                  className={
                    cliente.saldo_dinero > 0
                      ? 'text-danger font-bold'
                      : 'text-success font-bold'
                  }
                >
                  ${cliente.saldo_dinero}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary uppercase mb-2">
                Monto a cobrar ($)
              </label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="field field-lg text-center text-xl"
                placeholder="0"
                autoFocus
              />
              {cliente.saldo_dinero > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setMonto(cliente.saldo_dinero.toString())}
                    className="flex-1 text-xs bg-sand-100 py-1.5 rounded-lg text-secondary font-semibold hover:bg-sand-200"
                  >
                    Saldar total (${cliente.saldo_dinero})
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary uppercase mb-2">
                Método
              </label>
              <SegmentedControl
                fullWidth
                value={metodo}
                onChange={setMetodo}
                options={[
                  { value: 'transferencia', label: 'Transf.', icon: CreditCard },
                  { value: 'efectivo', label: 'Efectivo', icon: Banknote },
                ]}
              />
            </div>
          </form>
        </div>

        <ModalFooter>
          <Button
            type="submit"
            form="cobro-form"
            disabled={loading || !monto}
            variant="success" size="lg" fullWidth
          >
            {loading ? 'Guardando...' : 'Confirmar Cobro'}
          </Button>
        </ModalFooter>
      </Modal>
  );
};