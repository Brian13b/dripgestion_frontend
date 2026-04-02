import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Wallet, Activity } from 'lucide-react';
import api from '../../api/axios'; // Ajustá esta ruta a tu instancia de Axios

export const MetricasView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const response = await api.get('/dashboard/resumen');
        setData(response.data);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetricas();
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-secondary text-xl animate-pulse">Cargando estadísticas...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-5 md:p-10 font-sans pb-24">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl md:text-4xl font-black text-primary-dark mb-2 flex items-center">
          <Activity size={32} className="mr-3 text-primary" /> Panel de Métricas
        </h1>
        <p className="text-secondary font-bold tracking-widest uppercase text-sm mb-8">Análisis y Rendimiento del Negocio</p>

        {/* KPIs SUPERIORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 flex items-center">
            <div className="bg-success/20 p-4 rounded-2xl mr-4"><TrendingUp size={28} className="text-success" /></div>
            <div>
              <p className="text-sm font-bold text-secondary uppercase tracking-wider">Recaudación Mes</p>
              <p className="text-3xl font-black text-primary-dark">${data.kpis.recaudacion_mes}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 flex items-center">
            <div className="bg-orange-500/20 p-4 rounded-2xl mr-4"><Wallet size={28} className="text-orange-500" /></div>
            <div>
              <p className="text-sm font-bold text-secondary uppercase tracking-wider">Deuda en la Calle</p>
              <p className="text-3xl font-black text-primary-dark">${data.kpis.deuda_en_calle}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 flex items-center">
            <div className="bg-primary/20 p-4 rounded-2xl mr-4"><Users size={28} className="text-primary" /></div>
            <div>
              <p className="text-sm font-bold text-secondary uppercase tracking-wider">Entregas del Mes</p>
              <p className="text-3xl font-black text-primary-dark">{data.kpis.entregas_mes}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 flex items-center">
            <div className="bg-blue-500/20 p-4 rounded-2xl mr-4"><Activity size={28} className="text-blue-500" /></div>
            <div>
              <p className="text-sm font-bold text-secondary uppercase tracking-wider">Envases en la Calle</p>
              <p className="text-3xl font-black text-primary-dark">{data.kpis.total_envases}</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Evolución Anual */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20">
            <h2 className="text-lg font-bold text-primary-dark tracking-wide mb-6">Evolución de Ingresos (Año Actual)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.grafico_anual}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Recaudación']} labelStyle={{fontWeight: 'bold', color: '#0C4A6E'}} />
                  <Line type="monotone" dataKey="total" stroke="#25A7DA" strokeWidth={4} dot={{r: 4, fill: '#25A7DA', strokeWidth: 2}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20">
            <h2 className="text-lg font-bold text-primary-dark tracking-wide mb-6">Métodos de Pago (Mes Actual)</h2>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.grafico_metodos} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {data.grafico_metodos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {data.grafico_metodos.map((entry, index) => (
                <div key={index} className="flex items-center text-sm font-bold text-secondary">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>

          {/* Rendimiento por Chofer (Barras) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 lg:col-span-2">
            <h2 className="text-lg font-bold text-primary-dark tracking-wide mb-6">Rendimiento por Chofer (Mes Actual)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.grafico_choferes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value, name) => [name === 'recaudado' ? `$${value}` : value, name === 'recaudado' ? 'Recaudado' : 'Entregas']} labelStyle={{fontWeight: 'bold', color: '#0C4A6E'}} />
                  <Bar dataKey="recaudado" fill="#0C4A6E" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};