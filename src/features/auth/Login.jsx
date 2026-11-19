import React, { useEffect, useRef, useState, useContext } from 'react';
import { Button } from '../../components/primitives/Button';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { Droplet, Lock, Phone, ShieldCheck } from 'lucide-react';
import { BotonInstalar } from '../../components/ui/BotonInstalar';
import { notify } from '../../lib/notify';
import { urlWhatsapp } from '../../lib/whatsapp';

export const Login = () => {
  const { login, user } = useContext(AuthContext);
  const { tenant } = useTenant();

  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  // true mientras este componente hace el login: evita que el efecto de abajo
  // navegue antes de que termine la animación de entrada.
  const loginInFlight = useRef(false);
  const redirectTimer = useRef(null);

  const isRootDomain = !tenant || !tenant.id;

  const homeByRole = (role) => {
    const r = role?.toLowerCase();
    if (r === 'superadmin') return '/superadmin';
    if (r === 'cliente') return '/mi-portal';
    return '/dashboard';
  };

  // Sesión ya iniciada (ej. volver a /login): redirigir sin animación.
  useEffect(() => {
    if (user && !loginInFlight.current) navigate(homeByRole(user.role), { replace: true });
  }, [user, navigate]);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    loginInFlight.current = true;

    try {
      const userData = await login(username, password, tenant?.id);

      if (!userData) {
        loginInFlight.current = false;
        notify.error('Credenciales incorrectas');
        setIsLoading(false);
        return;
      }

      // 1) la capa se expande (600ms)  2) el contenido aparece  3) navegamos
      setIsTransitioning(true);
      redirectTimer.current = setTimeout(() => {
        navigate(homeByRole(userData.role), { replace: true });
      }, 1100);
    } catch (error) {
      console.error('Error en login:', error);
      loginInFlight.current = false;
      notify.error(error, 'Credenciales incorrectas o problemas de conexión');
      setIsLoading(false);
    }
  };

  // Sin WhatsApp cargado por la empresa no hay a quien escribir: no se muestra el boton.
  const whatsappPin = urlWhatsapp(tenant?.whatsapp, 'Hola! Necesito saber mi PIN.');
  const handlePedirPorWhatsApp = () => {
    if (whatsappPin) window.open(whatsappPin, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      
      {/* CAPA DE TRANSICIÓN: círculo que se expande desde el botón de ingreso */}
      <div
        aria-hidden={!isTransitioning}
        className="absolute inset-0 bg-primary-dark z-50 flex flex-col items-center justify-center text-white pointer-events-none"
        style={{
          clipPath: isTransitioning ? 'circle(150% at 50% 75%)' : 'circle(0% at 50% 75%)',
          transition: 'clip-path 600ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transform: isTransitioning ? 'none' : 'translateY(8px)',
            transition: 'opacity 300ms ease-out 250ms, transform 300ms cubic-bezier(0.23, 1, 0.32, 1) 250ms',
          }}
        >
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-5 anim-pulse-soft">
            <Droplet size={52} className="text-white fill-white/20" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Cargando tu espacio...</h2>
        </div>
      </div>

      {/* Lado Izquierdo */}
      <div className="bg-primary-dark md:w-1/2 md:min-h-screen flex flex-col items-center justify-center text-white pt-12 pb-24 md:py-12 px-4 shadow-2xl rounded-b-3xl md:rounded-none md:rounded-r-[60px] z-10 transition-transform duration-500">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full mb-6 border-4 border-white/30 flex items-center justify-center overflow-hidden shrink-0 mx-auto shadow-xl">
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={`Logo de ${tenant.nombre}`}
              className="w-full h-full object-contain p-2"
            />
          ) : isRootDomain ? (
            <ShieldCheck size={56} className="text-primary" strokeWidth={1.5} />
          ) : (
            <Droplet size={56} className="text-primary" strokeWidth={1.5} />
          )}
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tight text-center">
          {tenant?.nombre || 'Drip Gestión'}
        </h1>
        <p className="text-primary-light font-medium tracking-wide md:text-xl uppercase text-center">
          {isRootDomain ? 'Administración Central SaaS' : 'Gestión & Distribución'}
        </p>
      </div>

      {/* Lado Derecho */}
      <div className="flex-1 px-5 -mt-16 mb-8 md:mt-0 z-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-md border border-primary-light/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-dark tracking-tight">
              Bienvenido
            </h2>
            <p className="text-secondary mt-2 font-medium">
              Ingresá tus credenciales de acceso
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">
                {isRootDomain ? 'Usuario Administrador' : 'Usuario / Teléfono'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={20} className="text-primary" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="field field-lg pl-12 pr-4"
                  placeholder={isRootDomain ? 'Ej: brian_admin' : 'Ej: 261-1234567'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">
                Contraseña / PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-primary" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field field-lg pl-12 pr-4 font-black tracking-widest"
                  placeholder="* * * *"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="dark" size="lg" fullWidth
            >
              {isLoading ? 'Verificando...' : 'Ingresar al sistema'}
            </Button>
          </form>

          {!isRootDomain && whatsappPin && (
            <Button
              onClick={handlePedirPorWhatsApp}
              variant="whatsapp" size="lg" fullWidth
            >
              ¿No tenés PIN? Contactanos.
            </Button>
          )}

          <div className="mt-8 pt-6 border-t border-sand-100 flex flex-col items-center">
            <p className="text-[11px] text-secondary font-bold uppercase tracking-widest mb-3">
              Mejorá tu experiencia
            </p>
            <BotonInstalar />
          </div>
        </div>
      </div>
    </div>
  );
};