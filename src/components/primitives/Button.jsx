import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = ({ size = 15 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    animate={{ rotate: 360 }}
    transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
    aria-hidden
    className="shrink-0"
  >
    <circle
      cx="7.5" cy="7.5" r="5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="34.5"
      strokeDashoffset="26"
    />
  </motion.svg>
);

/* ─── Variantes de estilo ────────────────────────────────────────────────── */
// Ver DESIGN_SYSTEM.md → "Botones". Una sola receta por intención.
const variantStyles = {
  primary: [
    'bg-primary text-white',
    'shadow-sm shadow-primary/20',
    'hover:shadow-md hover:shadow-primary/30 hover:brightness-105',
  ],
  dark: [
    'bg-primary-dark text-white',
    'shadow-sm',
    'hover:bg-primary',
  ],
  secondary: [
    'bg-sand-100 text-primary-dark',
    'border border-sand-200',
    'hover:bg-sand-200/60',
  ],
  outline: [
    'bg-transparent text-primary',
    'border-2 border-primary',
    'hover:bg-primary/5',
  ],
  ghost: [
    'bg-transparent text-primary-dark',
    'hover:bg-sand-100 hover:text-primary',
  ],
  soft: [
    'bg-primary/10 text-primary',
    'hover:bg-primary/20',
  ],
  success: [
    'bg-success text-white',
    'shadow-sm shadow-success/20',
    'hover:brightness-105',
  ],
  successSoft: [
    'bg-success/10 text-success',
    'hover:bg-success/20',
  ],
  danger: [
    'bg-danger text-white',
    'shadow-sm shadow-danger/20',
    'hover:brightness-105',
  ],
  dangerSoft: [
    'bg-danger/10 text-danger',
    'hover:bg-danger/20',
  ],
  whatsapp: [
    'bg-[#25D366] text-white',
    'shadow-sm',
    'hover:bg-[#20bd5a]',
  ],
  // Botón de acción sobre el header oscuro (PageHeader)
  onDark: [
    'bg-white text-primary',
    'shadow-sm',
    'hover:bg-primary-light hover:text-primary-dark',
  ],
  // Botón secundario / icono sobre el header oscuro (volver, ajustes)
  onDarkGhost: [
    'bg-white/10 text-white backdrop-blur-sm',
    'border border-white/15',
    'hover:bg-white/20',
  ],
};

// Alturas estándar: 36 / 44 / 56 px. md = target táctil mínimo recomendado.
const sizeStyles = {
  sm: 'h-9  px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5   text-sm gap-2   rounded-xl',
  lg: 'h-14 px-6   text-base gap-2.5 rounded-2xl',
};

// Botones solo-icono: cuadrados, mismas alturas que el resto.
const iconSizeStyles = {
  sm: 'h-9  w-9  rounded-xl',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
};

/* ─── Animación Emil-style ───────────────────────────────────────────────── */
// Spring calibrado: stiff + low damping = snap físico sin rebote excesivo
const pressTransition = {
  type: 'spring',
  stiffness: 600,
  damping: 35,
  mass: 0.6,
};

/* ─── Componente ─────────────────────────────────────────────────────────── */
export const Button = ({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  disabled  = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  iconOnly  = false,
  children,
  className,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={!isDisabled ? { scale: 0.964 } : undefined}
      transition={pressTransition}
      disabled={isDisabled}
      className={cn(
        // Base
        'relative inline-flex items-center justify-center',
        'font-semibold tracking-tight select-none whitespace-nowrap cursor-pointer',
        // Transición de color suave
        'transition-colors duration-150 ease-out',
        // Focus accesible
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        // Variante + tamaño
        variantStyles[variant],
        iconOnly ? iconSizeStyles[size] : sizeStyles[size],
        // Ancho completo
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {/* Contenido — swap animado entre normal y loading */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isLoading ? (
          <motion.span
            key="loading"
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            <Spinner size={size === 'sm' ? 13 : 15} />
            <span className="opacity-60">{children}</span>
          </motion.span>
        ) : (
          <motion.span
            key="content"
            className="inline-flex items-center gap-[inherit]"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            {leftIcon  && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
