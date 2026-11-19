import { clsx } from 'clsx';

/**
 * Contenedor estándar del cuerpo de una página (ver DESIGN_SYSTEM.md → "Espaciado de página").
 * Usa el MISMO gutter horizontal y el MISMO ancho máximo que el `PageHeader`, así el
 * contenido queda alineado con el título, y deja aire entre el header y el primer bloque.
 *
 *  - maxWidth: igual al del PageHeader de la página (default max-w-7xl).
 *  - top:      false cuando es el 2.º bloque seguido (no repite el espacio superior).
 *
 * El espacio inferior lo da la página (pb-24 en mobile por la BottomNav).
 */
export const PageContent = ({ children, maxWidth = 'max-w-7xl', top = true, className }) => (
  <div
    className={clsx(
      'w-full mx-auto px-5 md:px-12 lg:px-16',
      top && 'pt-6 md:pt-8',
      maxWidth,
      className,
    )}
  >
    {children}
  </div>
);
