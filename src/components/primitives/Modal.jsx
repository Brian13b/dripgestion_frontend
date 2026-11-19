import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

/**
 * Cascarón estándar de modal (ver DESIGN_SYSTEM.md → "Modales").
 * Uso:
 *   <Modal>
 *     <ModalHeader title="..." subtitle="..." onClose={onClose} />
 *     <div className="p-6 overflow-y-auto flex-1">...</div>
 *     <ModalFooter><Button .../></ModalFooter>
 *   </Modal>
 *
 * - size:   'md' (default, max-w-md) | 'lg' (max-w-2xl)
 * - tall:   true → alto fijo 90vh (listas largas)
 * - sheet:  true → en mobile sube desde abajo como bottom-sheet
 */
export const Modal = ({ children, size = 'md', tall = false, sheet = false, className }) => (
  <div
    className={clsx(
      'fixed inset-0 z-100 flex justify-center bg-primary-dark/70 backdrop-blur-sm',
      sheet ? 'items-end md:items-center p-0 md:p-4' : 'items-center p-4',
    )}
  >
    <div
      className={clsx(
        'bg-white w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200',
        size === 'lg' ? 'max-w-2xl' : 'max-w-md',
        tall ? 'h-[90vh]' : 'max-h-[90vh]',
        sheet ? 'rounded-t-3xl md:rounded-3xl' : 'rounded-3xl',
        className,
      )}
    >
      {children}
    </div>
  </div>
);

export const ModalHeader = ({ title, subtitle, onClose }) => (
  <div className="px-5 py-4 border-b border-sand-100 bg-background flex items-center justify-between gap-3 shrink-0">
    <div className="min-w-0">
      <h2 className="text-xl font-bold text-primary-dark tracking-tight truncate">{title}</h2>
      {subtitle && <p className="text-sm text-secondary font-medium mt-0.5">{subtitle}</p>}
    </div>
    {onClose && (
      <Button variant="secondary" size="sm" iconOnly onClick={onClose} aria-label="Cerrar">
        <X size={18} />
      </Button>
    )}
  </div>
);

export const ModalFooter = ({ children, className }) => (
  <div className={clsx('p-5 border-t border-sand-100 bg-background shrink-0', className)}>
    {children}
  </div>
);
