import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

/** Estado de carga estándar (spinner + texto corto). */
export const LoadingState = ({ label = 'Cargando...', className }) => (
  <div
    role="status"
    aria-live="polite"
    className={clsx('flex flex-col items-center justify-center gap-3 py-16 text-secondary', className)}
  >
    <Loader2 size={28} className="animate-spin text-primary" />
    <p className="text-sm font-semibold">{label}</p>
  </div>
);

/** Estado vacío estándar: ícono, título, ayuda corta y una acción opcional. */
export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={clsx('flex flex-col items-center text-center gap-2 py-16 px-4 anim-page', className)}>
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-sand-100 text-secondary flex items-center justify-center mb-1">
        <Icon size={28} />
      </div>
    )}
    <p className="text-lg font-bold text-primary-dark">{title}</p>
    {description && <p className="text-sm text-secondary font-medium max-w-sm">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
