'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Activity, Database, ArrowLeft, ExternalLink, MousePointer, Clock, MapPin, Monitor, LogOut, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

interface LoginLog {
  id: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  email: string;
  success: boolean;
  location: string;
  formattedDate: string;
}

interface AdminStats {
  totalUsers: number;
  recentLogins: number;
  systemStatus: string;
  socialClicks: {
    github: number;
    linkedin: number;
    email: number;
    total: number;
  };
  projectClicks: {
    learnpro: number;
    mybudget: number;
    educaplus: number;
    total: number;
  };
}

export default function AdminAccess() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [recentLogs, setRecentLogs] = useState<LoginLog[]>([]);
  const [allLogs, setAllLogs] = useState<LoginLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [loadingRecentLogs, setLoadingRecentLogs] = useState(true);
  const [resetAction, setResetAction] = useState<'social' | 'projects' | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const router = useRouter();
  

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      checkAdminAccess();
    }
  }, [isAuthenticated, isLoading, router]);

  const checkAdminAccess = async () => {
    try {
      const adminData = await authService.getAdminDashboard();
      setIsAdmin(true);
      setAdminStats(adminData.stats);
      // Cargar automáticamente los últimos 5 logs
      await fetchRecentLogs();
    } catch (error) {
      setIsAdmin(false);
      setError('No tienes permisos de administrador');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentLogs = async () => {
    setLoadingRecentLogs(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentLogs(data.logs || []);
      } else {
        console.error('Error obteniendo logs recientes:', response.status);
      }
    } catch (error) {
      console.error('Error fetching recent logs:', error);
    } finally {
      setLoadingRecentLogs(false);
    }
  };

  const fetchAllLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllLogs(data.logs || []);
        setShowAllLogs(true);
      } else {
        console.error('Error obteniendo todos los logs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching all logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Desconocido';
  };

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return 'Móvil';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Escritorio';
  };

  const handleResetRequest = (type: 'social' | 'projects') => {
    const message = type === 'social' 
      ? '¿Estás seguro de que deseas reiniciar todas las estadísticas de clicks en redes sociales? Esta acción no se puede deshacer.'
      : '¿Estás seguro de que deseas reiniciar todas las estadísticas de clicks en proyectos? Esta acción no se puede deshacer.';
    
    const confirmed = window.confirm(message);
    
    if (confirmed) {
      setResetAction(type);
      handleConfirmReset(type);
    }
  };

  const handleConfirmReset = async (type: 'social' | 'projects') => {
    setResetLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Usar exactamente las rutas que ya funcionan en tu backend pero con la variable de entorno
      const endpoint = type === 'social' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reset-social` 
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reset-projects`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update admin stats
        const adminData = await authService.getAdminDashboard();
        setAdminStats(adminData.stats);
        setResetSuccess(true);
        
        // Mostrar mensaje de éxito
        const successMessage = type === 'social'
          ? 'Estadísticas de redes sociales reiniciadas correctamente'
          : 'Estadísticas de proyectos reiniciadas correctamente';
        
        setResetMessage(successMessage);
        alert(successMessage);
      } else {
        console.error('Error resetting stats:', response.status);
        alert('Error al reiniciar estadísticas. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error resetting stats:', error);
      alert('Error al reiniciar estadísticas. Inténtalo de nuevo.');
    } finally {
      setResetLoading(false);
      setResetAction(null);
    }
  };

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
            <p className="text-gray-400 mb-4">
              {error || 'No tienes permisos para acceder a esta página'}
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
              <p className="text-gray-400">Bienvenido, {user?.fullName || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al portfolio
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">                <div>
                  <p className="text-sm text-gray-400">Visitantes Únicos</p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Logins Recientes</p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats?.recentLogins || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Estado del Sistema</p>
                  <p className="text-2xl font-bold text-green-400">
                    {adminStats?.systemStatus || 'Operational'}
                  </p>
                </div>
                <Database className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Click Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Social Media Clicks */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Clicks en Redes Sociales</h3>
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5 text-blue-400" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600/40 text-blue-400 hover:bg-blue-600/20"
                    onClick={() => handleResetRequest('social')}
                    disabled={resetLoading}
                  >
                    {resetLoading && resetAction === 'social' ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Reiniciando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reiniciar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GitHub</span>
                  <span className="text-white font-semibold">
                    {adminStats?.socialClicks?.github || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">LinkedIn</span>
                  <span className="text-white font-semibold">
                    {adminStats?.socialClicks?.linkedin || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Email</span>
                  <span className="text-white font-semibold">
                    {adminStats?.socialClicks?.email || 0}
                  </span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between items-center font-bold">
                  <span className="text-blue-400">Total</span>
                  <span className="text-blue-400">
                    {adminStats?.socialClicks?.total || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Clicks */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Clicks en Proyectos</h3>
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-5 w-5 text-purple-400" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-600/40 text-purple-400 hover:bg-purple-600/20"
                    onClick={() => handleResetRequest('projects')}
                    disabled={resetLoading}
                  >
                    {resetLoading && resetAction === 'projects' ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Reiniciando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reiniciar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">LearnPro</span>
                  <span className="text-white font-semibold">
                    {adminStats?.projectClicks?.learnpro || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">MyBudget</span>
                  <span className="text-white font-semibold">
                    {adminStats?.projectClicks?.mybudget || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Educa+</span>
                  <span className="text-white font-semibold">
                    {adminStats?.projectClicks?.educaplus || 0}
                  </span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between items-center font-bold">
                  <span className="text-purple-400">Total</span>
                  <span className="text-purple-400">
                    {adminStats?.projectClicks?.total || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Login Logs - Mostrar automáticamente los últimos 5 */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Últimas Conexiones</h3>
              </div>
              <Button 
                onClick={fetchAllLogs}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                disabled={loadingLogs}
              >
                <Activity className="h-4 w-4 mr-2" />
                {loadingLogs ? 'Cargando...' : 'Ver Todos los Logs'}
              </Button>
            </div>
            
            {loadingRecentLogs ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-3 text-gray-400">Cargando conexiones recientes...</span>
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay logs de conexión disponibles</p>
              </div>
            ) : (              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white font-medium">{log.email}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {log.success ? 'Exitoso' : 'Fallido'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">{log.formattedDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">{log.ipAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">{getBrowserInfo(log.userAgent)} - {getDeviceInfo(log.userAgent)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Logs Table - Solo se muestra cuando el usuario hace clic */}
        {showAllLogs && (
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Historial Completo de Conexiones</h3>
                <Button 
                  onClick={() => setShowAllLogs(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-700"
                >
                  Ocultar
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="sticky top-0 bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ubicación</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Navegador</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dispositivo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-800 divide-y divide-gray-700">
                    {allLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-700">
                        <td className="px-4 py-3 text-sm text-white">{log.email}</td>
                        <td className="px-4 py-3 text-sm text-white">{log.formattedDate}</td>
                        <td className="px-4 py-3 text-sm text-white font-mono">{log.ipAddress}</td>
                        <td className="px-4 py-3 text-sm text-white">{log.location}</td>
                        <td className="px-4 py-3 text-sm text-white">{getBrowserInfo(log.userAgent)}</td>
                        <td className="px-4 py-3 text-sm text-white">{getDeviceInfo(log.userAgent)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${log.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {log.success ? 'Exitoso' : 'Fallido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Backend:</p>
                <p className="text-white">Express.js + Supabase</p>
              </div>
              <div>
                <p className="text-gray-400">Base de Datos:</p>
                <p className="text-white">PostgreSQL (Supabase)</p>
              </div>
              <div>
                <p className="text-gray-400">Frontend:</p>
                <p className="text-white">Next.js + TypeScript</p>
              </div>
              <div>
                <p className="text-gray-400">Autenticación:</p>
                <p className="text-white">Supabase Auth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}