import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Package, Wallet, Activity, Calendar, GitCompare } from 'lucide-react';
import api from '../../api/axios';

const getMesActualStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const MetricasView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [mesA, setMesA] = useState(getMesActualStr());
  const [mesB, setMesB] = useState("");

  useEffect(() => {
    const fetchMetricas = async () => {
      setLoading(true);
      try {
        const [anioA, mA] = mesA.split('-');
        let url = `/dashboard/resumen?mes_a=${mA}&anio_a=${anioA}`;
        
        if (mesB) {
          const [anioB, mB] = mesB.split('-');
          url += `&mes_b=${mB}&anio_b=${anioB}`;
        }
        
        const response = await api.get(url);
        setData(response.data);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetricas();
  }, [mesA, mesB]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-secondary text-xl animate-pulse">Cargando estadísticas...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-5 md:p-10 font-sans pb-24">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-primary-dark mb-2 flex items-center">
              <Activity size={32} className="mr-3 text-primary" /> Panel de Métricas
            </h1>
            <p className="text-secondary font-bold tracking-widest uppercase text-sm">Análisis Inteligente de Negocio</p>
          </div>
        </div>

        {/* SELECTORES DE COMPARACIÓN */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary-light/30 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1.5 ml-2 flex items-center">
              <Calendar size={14} className="mr-1.5" /> Período Principal
            </p>
            <input 
              type="month" 
              value={mesA} 
              onChange={(e) => setMesA(e.target.value)} 
              className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-primary-dark outline-none border border-slate-200 focus:border-primary transition-colors cursor-pointer" 
            />
          </div>
          
          <div className="hidden md:flex mt-6 bg-slate-100 p-2 rounded-full text-slate-400">
            <GitCompare size={20} />
          </div>

          <div className="flex-1 w-full relative">
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1.5 ml-2 flex items-center">
              <Calendar size={14} className="mr-1.5" /> Comparar contra
            </p>
            <input 
              type="month" 
              value={mesB} 
              onChange={(e) => setMesB(e.target.value)} 
              className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-primary-dark outline-none border border-slate-200 focus:border-primary transition-colors cursor-pointer" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20">
            <TrendingUp size={24} className="text-success mb-2" />
            <p className="text-xs font-bold text-secondary uppercase">Ingresos del Mes</p>
            <p className="text-2xl font-black text-primary-dark">${data.kpis.recaudacion_mes}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20">
            <Wallet size={24} className="text-orange-500 mb-2" />
            <p className="text-xs font-bold text-secondary uppercase">Deuda Total</p>
            <p className="text-2xl font-black text-primary-dark">${data.kpis.deuda_en_calle}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20">
            <Package size={24} className="text-blue-500 mb-2" />
            <p className="text-xs font-bold text-secondary uppercase">Envases Prestados</p>
            <p className="text-2xl font-black text-primary-dark">{data.kpis.total_envases}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20">
            <Activity size={24} className="text-primary mb-2" />
            <p className="text-xs font-bold text-secondary uppercase">Entregas Efectivas</p>
            <p className="text-2xl font-black text-primary-dark">{data.kpis.entregas_mes}</p>
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* COMPARATIVA DÍA A DÍA */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 lg:col-span-2">
            <h2 className="text-lg font-bold text-primary-dark tracking-wide mb-6">Comparativa de Ingresos ({data.labels.mes_a} vs {data.labels.mes_b})</h2>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.grafico_comparativo} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="dia" tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis tickFormatter={(val) => `$${val}`} tick={{fill: '#64748b', fontSize: 12}} width={80} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Recaudado']} labelFormatter={(label) => `Día ${label}`} />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" name={data.labels.mes_a} dataKey="mes_a" stroke="#0C4A6E" strokeWidth={4} dot={false} activeDot={{r: 6}} />
                  <Line type="monotone" name={data.labels.mes_b} dataKey="mes_b" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MÉTODOS DE PAGO */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20">
            <h2 className="text-lg font-bold text-primary-dark tracking-wide mb-2">Ingresos por Método</h2>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.grafico_metodos} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {data.grafico_metodos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {data.grafico_metodos.map((entry, index) => (
                <div key={index} className="flex items-center text-xs font-bold text-secondary">
                  <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: entry.color }}></div>{entry.name}
                </div>
              ))}
            </div>
          </div>

          {/* RENDIMIENTO POR RECORRIDO (BARRAS) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 lg:col-span-3">
            <h2 className="text-lg font-bold text-primary-dark tracking-wide mb-6">Rentabilidad por Recorrido (Zonas)</h2>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.grafico_recorridos} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 'bold'}} />
                  <YAxis yAxisId="left" tickFormatter={(val) => `$${val}`} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value, name) => [name === 'recaudado' ? `$${value}` : value, name === 'recaudado' ? 'Recaudación' : 'Entregas']} />
                  <Bar yAxisId="left" name="Recaudación" dataKey="recaudado" fill="#25A7DA" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};