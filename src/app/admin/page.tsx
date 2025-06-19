'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Activity, Database, ArrowLeft, ExternalLink, MousePointer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
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
    } catch (error) {
      setIsAdmin(false);
      setError('No tienes permisos de administrador');
    } finally {
      setLoadingStats(false);
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
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al portfolio
          </Button>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Visitantes totales</p>
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
                <ExternalLink className="h-5 w-5 text-blue-400" />
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
                <MousePointer className="h-5 w-5 text-purple-400" />
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

        {/* Admin Actions */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Logs del Sistema</h3>
              <p className="text-gray-400 mb-4">
                Revisa la actividad y logs del sistema
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Activity className="h-4 w-4 mr-2" />
                Ver Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="bg-zinc-900 border-zinc-800 mt-6">
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