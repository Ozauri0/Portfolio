'use client';

import React, { useState, useEffect } from 'react';
import authService from '@/services/authService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, Clock, RefreshCw, BarChart2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyData  { date: string; visits: number }
interface HourlyData { hour: number; visits: number }
interface ChartData  { daily: DailyData[]; hourly: HourlyData[]; totalInPeriod: number }
type TimeRange = 'day' | 'week' | 'month' | 'year';
type ChartType  = 'daily' | 'hourly';

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'day',   label: 'Hoy'  },
  { value: 'week',  label: '7 d'  },
  { value: 'month', label: '30 d' },
  { value: 'year',  label: '1 año'},
];

const VisitorChart: React.FC<{ className?: string }> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [chartType, setChartType] = useState<ChartType>('daily');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) { setError('Sin autenticación'); setLoading(false); return; }

      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/visitor-chart?timeRange=${timeRange}`,
        { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }
      );
      const json = await res.json();

      if (json.success) {
        setChartData(json.data ?? {
          daily: [],
          hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, visits: 0 })),
          totalInPeriod: 0,
        });
      } else {
        setError(json.error || 'Error al cargar datos');
        setChartData({ daily: [], hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, visits: 0 })), totalInPeriod: 0 });
      }
    } catch {
      setError('Error de red');
      setChartData({ daily: [], hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, visits: 0 })), totalInPeriod: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChartData(); }, [timeRange]);

  /* ── Gradientes dinámicos ─────────────────────────────── */
  const getLineGradient = (ctx: CanvasRenderingContext2D, area: { top: number; bottom: number }) => {
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0,   'rgba(99, 102, 241, 0.35)');
    g.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
    g.addColorStop(1,   'rgba(99, 102, 241, 0)');
    return g;
  };

  const getBarGradient = (ctx: CanvasRenderingContext2D, area: { top: number; bottom: number }) => {
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, 'rgba(139, 92, 246, 0.85)');
    g.addColorStop(1, 'rgba(99, 102, 241, 0.4)');
    return g;
  };

  /* ── Opciones compartidas ─────────────────────────────── */
  const sharedScales = {
    x: {
      grid:   { color: 'rgba(255,255,255,0.04)' },
      border: { display: false },
      ticks:  { color: '#71717a', font: { size: 11 as const }, maxRotation: 0 },
    },
    y: {
      grid:        { color: 'rgba(255,255,255,0.04)' },
      border:      { display: false },
      ticks:       { color: '#71717a', font: { size: 11 as const }, precision: 0 },
      beginAtZero: true,
    },
  };

  const sharedTooltip = {
    backgroundColor: '#18181b',
    titleColor:      '#e4e4e7',
    bodyColor:       '#a1a1aa',
    borderColor:     '#3f3f46',
    borderWidth:     1,
    padding:         10,
    cornerRadius:    8,
    displayColors:   false,
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      title:  { display: false },
      tooltip: { ...sharedTooltip, callbacks: { label: (ctx) => `  ${ctx.parsed.y} visitas` } },
    },
    scales: sharedScales,
    elements: {
      line:  { tension: 0.4, borderWidth: 2, borderColor: '#6366f1' },
      point: { radius: 0, hoverRadius: 5, hoverBackgroundColor: '#6366f1', hoverBorderColor: '#fff', hoverBorderWidth: 2 },
    },
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      title:  { display: false },
      tooltip: { ...sharedTooltip, callbacks: { label: (ctx) => `  ${ctx.parsed.y} visitas` } },
    },
    scales: sharedScales,
    elements: { bar: { borderRadius: 4, borderSkipped: false } },
  };

  /* ── Datasets ─────────────────────────────────────────── */
  const lineDataset = {
    label: 'Visitas',
    data:  chartData?.daily.map(d => d.visits) ?? [],
    borderColor: '#6366f1',
    backgroundColor: (ctx: any) => {
      const c = ctx.chart;
      if (!c.chartArea) return 'transparent';
      return getLineGradient(c.ctx, c.chartArea);
    },
    fill: true,
  };

  const barDataset = {
    label: 'Visitas',
    data:  chartData?.hourly.map(d => d.visits) ?? [],
    backgroundColor: (ctx: any) => {
      const c = ctx.chart;
      if (!c.chartArea) return 'rgba(139,92,246,0.6)';
      return getBarGradient(c.ctx, c.chartArea);
    },
    borderColor: 'transparent',
  };

  const lineData = {
    labels: chartData?.daily.map(d =>
      new Date(d.date).toLocaleDateString('es-CL', {
        day: '2-digit', month: '2-digit',
        ...(timeRange === 'year' ? { year: '2-digit' } : {}),
      })
    ) ?? [],
    datasets: [lineDataset],
  };

  const barData = {
    labels:   chartData?.hourly.map(d => `${d.hour}h`) ?? [],
    datasets: [barDataset],
  };

  const hasData =
    (chartType === 'daily'  && (chartData?.daily.some(d => d.visits > 0) ?? false)) ||
    (chartType === 'hourly' && (chartData?.hourly.some(d => d.visits > 0) ?? false));

  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden ${className ?? ''}`}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Título + total */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-tight">Estadísticas de visitas</h3>
              <p className="text-xs text-zinc-500 leading-tight">
                {loading ? '—' : `${chartData?.totalInPeriod ?? 0} visitas en el período`}
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tipo de gráfico */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setChartType('daily')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  chartType === 'daily' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <TrendingUp className="h-3 w-3" /> Diario
              </button>
              <button
                onClick={() => setChartType('hourly')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  chartType === 'hourly' ? 'bg-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="h-3 w-3" /> Por hora
              </button>
            </div>

            {/* Rango de tiempo */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimeRange(opt.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    timeRange === opt.value ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchChartData}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="px-6 py-5">
        {error && (
          <p className="text-xs text-red-400 mb-3 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="w-full h-64">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-indigo-500 animate-spin" />
              <span className="text-xs text-zinc-600">Cargando datos…</span>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <BarChart2 className="h-10 w-10 text-zinc-800" />
              <p className="text-sm text-zinc-600 font-medium">Sin datos en este período</p>
              <p className="text-xs text-zinc-700">Cambia el rango o espera más visitas</p>
            </div>
          ) : chartType === 'daily' ? (
            <Line options={lineOptions} data={lineData} />
          ) : (
            <Bar options={barOptions} data={barData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorChart;
