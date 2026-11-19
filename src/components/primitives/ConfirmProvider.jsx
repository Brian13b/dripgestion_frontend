import { useCallback, useRef, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';
import { Modal, ModalFooter } from './Modal';
import { ConfirmContext } from './ConfirmContext';

/**
 * Diálogo de confirmación propio (reemplaza window.confirm / alert).
 * Opciones: title, message, confirmLabel, cancelLabel, tone ('danger' | 'primary'), hideCancel.
 */
export const ConfirmProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      }),
    [],
  );

  const close = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const tone = options?.tone || 'danger';
  const Icon = tone === 'danger' ? AlertTriangle : Info;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Modal size="sm" onClose={() => close(false)} overlayClassName="z-110">
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="p-6 text-center">
            <div
              className={
                'mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center ' +
                (tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary')
              }
            >
              <Icon size={28} />
            </div>
            <h2 id="confirm-title" className="text-xl font-bold text-primary-dark tracking-tight">
              {options.title || '¿Confirmar?'}
            </h2>
            {options.message && (
              <p className="mt-2 text-sm text-secondary font-medium whitespace-pre-line">{options.message}</p>
            )}
          </div>
          <ModalFooter className="flex gap-3">
            {!options.hideCancel && (
              <Button variant="secondary" size="md" className="flex-1" onClick={() => close(false)}>
                {options.cancelLabel || 'Cancelar'}
              </Button>
            )}
            <Button
              autoFocus
              variant={tone === 'danger' ? 'danger' : 'primary'}
              size="md"
              className="flex-1"
              onClick={() => close(true)}
            >
              {options.confirmLabel || 'Confirmar'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
};
