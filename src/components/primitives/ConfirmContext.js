import { createContext, useContext } from 'react';

export const ConfirmContext = createContext(null);

/**
 * const confirm = useConfirm();
 * if (!(await confirm({ title, message, confirmLabel, tone: 'danger' }))) return;
 */
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
};
