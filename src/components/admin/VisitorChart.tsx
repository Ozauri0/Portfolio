'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import authService from '@/services/authService';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement,
  TimeScale,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Calendar, ChevronDown, Clock, RefreshCw } from 'lucide-react';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface VisitorChartProps {
  className?: string;
}

interface DailyData {
  date: string;
  visits: number;
}

interface HourlyData {
  hour: number;
  visits: number;
}

interface ChartData {
  daily: DailyData[];
  hourly: HourlyData[];
  totalInPeriod: number;
}

type TimeRange = 'day' | 'week' | 'month' | 'year';

const VisitorChart: React.FC<VisitorChartProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chartType, setChartType] = useState<'daily' | 'hourly'>('daily');

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

      console.log('Fetching chart data from:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/visitor-chart?timeRange=${timeRange}`);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/visitor-chart?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      console.log('API Response status:', response.status);
      
      const result = await response.json();
      console.log('API Response data:', result);
      
      if (result.success) {
        setChartData(result.data || {
          daily: [],
          hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, visits: 0 })),
          totalInPeriod: 0
        });
        
        if (result.message) {
          setError(result.message);
        }
      } else {
        setError(result.error || 'Error desconocido al cargar datos');
        // Establecer datos vacíos en caso de error
        setChartData({
          daily: [],
          hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, visits: 0 })),
          totalInPeriod: 0
        });
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Error al cargar los datos del gráfico');
      // Establecer datos vacíos en caso de error
      setChartData({
        daily: [],
        hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, visits: 0 })),
        totalInPeriod: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('VisitorChart se está renderizando con timeRange:', timeRange);
    fetchChartData();
  }, [timeRange]);

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: timeRange === 'year' ? '2-digit' : undefined
    });
  };

  const formatHourLabel = (hour: number) => {
    return `${hour}:00`;
  };

  // Opciones para el gráfico diario
  const dailyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: true,
        text: 'Visitas por día',
        color: '#ffffff',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  // Opciones para el gráfico por hora
  const hourlyChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: true,
        text: 'Visitas por hora',
        color: '#ffffff',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  // Preparar datos para el gráfico diario
  const dailyChartData = {
    labels: chartData?.daily.map(item => formatDateLabel(item.date)) || [],
    datasets: [
      {
        label: 'Visitas',
        data: chartData?.daily.map(item => item.visits) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Preparar datos para el gráfico por hora
  const hourlyChartData = {
    labels: chartData?.hourly.map(item => formatHourLabel(item.hour)) || [],
    datasets: [
      {
        label: 'Visitas',
        data: chartData?.hourly.map(item => item.visits) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const timeRangeOptions = [
    { value: 'day', label: 'Último día' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'year', label: 'Último año' },
  ];

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    setShowDropdown(false);
  };

  const getTimeRangeLabel = () => {
    return timeRangeOptions.find(option => option.value === timeRange)?.label || 'Última semana';
  };

  return (
    <Card className={`bg-zinc-900 border-zinc-800 ${className || ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Estadísticas de Visitas</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Botón Diario */}
            <Button
              variant={chartType === 'daily' ? 'default' : 'outline'}
              size="sm"
              className={chartType === 'daily' ? 'bg-blue-600 text-white' : 'border-zinc-700 text-zinc-300'}
              onClick={() => setChartType('daily')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Diario
            </Button>
            
            {/* Botón Por hora */}
            <Button
              variant={chartType === 'hourly' ? 'default' : 'outline'}
              size="sm"
              className={chartType === 'hourly' ? 'bg-purple-600 text-white' : 'border-zinc-700 text-zinc-300'}
              onClick={() => setChartType('hourly')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Por hora
            </Button>
            
            {/* Selector de rango de tiempo */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600/40 text-blue-400 hover:bg-blue-600/20 flex items-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {getTimeRangeLabel()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                  {timeRangeOptions.map(option => (
                    <button
                      key={option.value}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
                      onClick={() => handleTimeRangeChange(option.value as TimeRange)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Botón de recargar */}
            <Button
              variant="outline"
              size="sm"
              className="border-green-600/40 text-green-400 hover:bg-green-600/20"
              onClick={fetchChartData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400 mr-1"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Estadística de total de visitas */}
        {chartData && (
          <div className="mb-4 bg-zinc-800 p-3 rounded-md">
            <p className="text-white">
              <span className="text-gray-400">Total de visitas en este período: </span>
              <span className="font-bold text-blue-400">{chartData.totalInPeriod}</span>
            </p>
          </div>
        )}
        
        {/* Contenedor del gráfico */}
        <div className="w-full h-60 sm:h-70 md:h-80 mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Cargando datos...</span>
            </div>
          ) : (
            <>
              {chartData ? (
                chartData.daily.length > 0 || chartData.hourly.some(item => item.visits > 0) ? (
                  chartType === 'daily' ? (
                    <Line options={dailyChartOptions} data={dailyChartData} />
                  ) : (
                    <Bar options={hourlyChartOptions} data={hourlyChartData} />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-400 text-xl mb-4">No hay datos de visitas para mostrar</p>
                    <p className="text-gray-500 text-sm max-w-md text-center">
                      El gráfico mostrará datos una vez que los visitantes comiencen a navegar por tu sitio web. 
                      Puedes probar cambiando el rango de tiempo o revisa que la tabla unique_visitors exista en la base de datos.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No hay datos disponibles</p>
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorChart;