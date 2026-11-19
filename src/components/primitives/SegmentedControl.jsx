import { clsx } from 'clsx';

/**
 * Selector de una opción entre pocas (tabs, método de pago, filtros).
 * options: [{ value, label, icon?: LucideIcon }]
 * variant: 'pills' (default, fila de botones) | 'stacked' (columna en desktop, scroll horizontal en mobile)
 */
export const SegmentedControl = ({
  options,
  value,
  onChange,
  variant = 'pills',
  size = 'md',
  fullWidth = false,
  className,
}) => (
  <div
    role="tablist"
    className={clsx(
      variant === 'stacked'
        ? 'flex md:flex-col gap-2 overflow-x-auto'
        : 'inline-flex gap-1.5 p-1 rounded-2xl bg-sand-100',
      fullWidth && 'w-full',
      className,
    )}
  >
    {options.map(({ value: v, label, icon: Icon }) => {
      const active = v === value;
      return (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(v)}
          className={clsx(
            'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none cursor-pointer',
            'transition-colors duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            size === 'sm' ? 'h-9 px-3.5 text-sm' : size === 'lg' ? 'h-14 px-5 text-base' : 'h-11 px-5 text-sm',
            fullWidth && 'flex-1',
            variant === 'stacked' && 'md:justify-start shrink-0',
            active
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : variant === 'stacked'
                ? 'text-secondary hover:bg-primary/10 hover:text-primary-dark'
                : 'text-secondary hover:text-primary-dark hover:bg-white/60',
          )}
        >
          {Icon && <Icon size={18} className="shrink-0" />}
          {label}
        </button>
      );
    })}
  </div>
);
