import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../primitives/Button';
import { useConfirm } from '../primitives/ConfirmContext';

export const BotonInstalar = () => {
  const confirm = useConfirm();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(checkStandalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      await confirm({
        title: 'Instalar en iPhone',
        message: '1. Tocá el botón "Compartir" (el cuadradito con la flecha hacia arriba, en la barra de abajo).\n2. Elegí "Agregar a inicio".',
        confirmLabel: 'Entendido',
        hideCancel: true,
        tone: 'primary',
      });
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  if (isStandalone || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <Button onClick={handleInstallClick} variant="primary" size="md" leftIcon={<Download size={18} />} className="w-full md:w-auto">
      Instalar App
    </Button>
  );
};
