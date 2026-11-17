import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Banknote, CreditCard, BookOpen, Package, Recycle } from 'lucide-react';

export const ResumenReparto = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) return <Navigate to="/dashboard" />;

  const { resumen, nombreRuta } = location.state;
  const totalRecaudado = resumen.efectivo + resumen.transferencia;
  const listaProductos = Object.values(resumen.productos || {});
  const listaEnvases = Object.values(resumen.envases || {});

  return (
    <div className="min-h-screen bg-background pb-24 font-sans selection:bg-primary-light selection:text-primary-dark">
      <div className="bg-success text-white py-12 px-5 flex flex-col items-center justify-center shadow-lg rounded-b-3xl">
        <div className="bg-white/20 p-4 rounded-full mb-4">
          <Check size={48} strokeWidth={3} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          Viaje Finalizado
        </h1>
        <p className="text-success-100 font-bold tracking-widest uppercase text-sm md:text-base">
          {nombreRuta || 'Ruta Completada'}
        </p>
      </div>

      <div className="max-w-xl mx-auto p-5 space-y-5 -mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary rounded-3xl p-6 text-white shadow-xl flex flex-col items-center text-center">
            <Banknote size={32} className="mb-2 opacity-80" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-90">
              Recaudado
            </p>
            <p className="text-4xl md:text-5xl font-black mt-1">${totalRecaudado}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 text-primary-dark shadow-sm border border-primary-light/30 flex flex-col items-center text-center">
            <BookOpen size={32} className="mb-2 text-slate-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              A Cuenta
            </p>
            <p className="text-4xl md:text-5xl font-black mt-1">${resumen.fiado}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-primary-light/30">
          <h3 className="font-bold text-primary-dark text-xl mb-5 border-b border-primary-light/20 pb-3 tracking-wide">
            Desglose de Cobros
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-base">
              <span className="flex items-center font-bold text-secondary">
                <Banknote size={20} className="mr-3 text-primary" /> Efectivo
              </span>
              <span className="font-black text-2xl text-primary-dark">
                ${resumen.efectivo}
              </span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="flex items-center font-bold text-secondary">
                <CreditCard size={20} className="mr-3 text-primary" /> Transferencia
              </span>
              <span className="font-black text-2xl text-primary-dark">
                ${resumen.transferencia}
              </span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="flex items-center font-bold text-secondary">
                <BookOpen size={20} className="mr-3 text-primary" /> A Cuenta (Fiado)
              </span>
              <span className="font-black text-2xl text-orange-500">
                ${resumen.fiado}
              </span>
            </div>
          </div>
        </div>

        {/* MERCADERÍA ENTREGADA */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-primary-light/30">
          <h3 className="font-bold text-primary-dark text-xl mb-5 border-b border-primary-light/20 pb-3 tracking-wide flex items-center gap-2">
            <Package size={22} className="text-primary" /> Mercadería Entregada
          </h3>
          {listaProductos.length === 0 ? (
            <p className="text-secondary text-center italic py-4">
              No se registraron entregas de productos.
            </p>
          ) : (
            <div className="space-y-3">
              {listaProductos.map((prod, index) => (
                <div
                  key={index}
                  className="bg-background p-4 rounded-2xl border border-primary-light/40 flex justify-between items-center"
                >
                  <p className="font-bold text-primary-dark text-base">
                    {prod.nombre}
                  </p>
                  <span className="bg-white px-3.5 py-1.5 rounded-xl border border-primary-light/30 text-primary-dark font-black text-sm">
                    {prod.entregado} un.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BALANCE DE ENVASES RETORNABLES */}
        {listaEnvases.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-200">
            <h3 className="font-bold text-primary-dark text-xl mb-5 border-b border-emerald-100 pb-3 tracking-wide flex items-center gap-2">
              <Recycle size={22} className="text-emerald-600" /> Balance de Envases
            </h3>
            <div className="space-y-4">
              {listaEnvases.map((env, index) => (
                <div
                  key={index}
                  className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/70"
                >
                  <p className="font-bold text-primary-dark text-lg mb-3 tracking-wide">
                    {env.nombre}
                  </p>
                  <div className="flex justify-between text-sm font-bold text-secondary mb-2">
                    <span>Entregados</span>
                    <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 text-primary-dark">
                      {env.entregado}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-secondary">
                    <span>Devueltos (Vacíos)</span>
                    <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 text-primary-dark">
                      {env.devuelto}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-4 bg-primary-dark hover:bg-primary text-white font-bold py-5 rounded-3xl shadow-lg transition-colors active:scale-95 text-xl tracking-wider"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};