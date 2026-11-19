import { clsx } from 'clsx';
import { Button } from './Button';

/**
 * Header estándar de página (ver DESIGN_SYSTEM.md → "Page header").
 * Reglas fijas:
 *  - Misma altura que el header del Sidebar (128px en lg+, 96px en mobile).
 *  - Esquinas rectas, sin botón de volver.
 *  - <h1> con el nombre de la sección + <p> muy breve de qué se hace ahí.
 *  - Como máximo UNA acción a la derecha, y solo para crear/agregar algo.
 */
export const PageHeader = ({ title, subtitle, actions, maxWidth = 'max-w-7xl', className }) => (
  <header
    className={clsx(
      'sticky top-0 z-20 text-white',
      'bg-primary-dark border-b-4 border-primary shadow-md rounded-none',
      'h-24 lg:h-32 px-5 md:px-12 lg:px-16 flex items-center',
      className,
    )}
  >
    <div className={clsx('w-full mx-auto flex items-center justify-between gap-4', maxWidth)}>
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-primary-light text-sm md:text-base font-medium mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </header>
);

/**
 * Acción única del header: ícono + texto en desktop, solo ícono (44×44) en mobile.
 */
export const HeaderAction = ({ icon: Icon, label, onClick, variant = 'onDark', ...props }) => (
  <Button
    variant={variant}
    onClick={onClick}
    aria-label={label}
    className="max-md:w-11 max-md:px-0"
    {...props}
  >
    {Icon && <Icon size={20} />}
    <span className="hidden md:inline">{label}</span>
  </Button>
);
