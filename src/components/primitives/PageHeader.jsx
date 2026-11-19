import { ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

/**
 * Header estándar de página. Una sola receta de alto, padding, tipografía y
 * sombra para TODAS las vistas (ver DESIGN_SYSTEM.md → "Page header").
 *
 * Props:
 *  - title      (string | node)  Título de página.
 *  - subtitle   (string | node)  Bajada opcional.
 *  - eyebrow    (string)         Texto chico sobre el título (ej. "Recorrido en curso").
 *  - icon       (LucideIcon)     Ícono opcional a la izquierda del título.
 *  - onBack     (fn)             Si existe, muestra botón "volver".
 *  - actions    (node)           Acciones a la derecha (usar <HeaderAction />).
 *  - maxWidth   (string)         Clase max-w-* del contenido. Default max-w-7xl.
 */
export const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  onBack,
  actions,
  maxWidth = 'max-w-7xl',
  className,
}) => (
  <header
    className={clsx(
      'sticky top-0 z-20 text-white',
      'bg-primary-dark border-b-4 border-primary shadow-md rounded-b-3xl',
      'px-5 md:px-12 lg:px-16 py-5 md:py-6 min-h-24 flex items-center',
      className,
    )}
  >
    <div className={clsx('w-full mx-auto flex items-center justify-between gap-4', maxWidth)}>
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {onBack && (
          <Button
            variant="onDarkGhost"
            iconOnly
            onClick={onBack}
            aria-label="Volver"
            className="shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-primary-light text-xs font-bold uppercase tracking-widest mb-0.5">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3 truncate">
            {Icon && <Icon size={26} className="shrink-0" />}
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-primary-light text-sm md:text-base font-medium mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 md:gap-3 shrink-0">{actions}</div>}
    </div>
  </header>
);

/**
 * Acción principal del header: ícono + texto en desktop, solo ícono en mobile.
 * Misma altura (44px) y radio en todas las vistas.
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
