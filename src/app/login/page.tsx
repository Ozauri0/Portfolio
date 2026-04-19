'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NodeBackground from '@/components/node-background';

export default function SecretAdminAccess() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      await login(formData.email, formData.password);
      // If login doesn't throw an error, it was successful
      setSuccess('Autenticación exitosa. Redirigiendo...');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error?.message || 'Error en la autenticación');
    }
  };
  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4">
        <NodeBackground />
        <Card className="relative z-10 w-full max-w-md bg-black border-zinc-800">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">Ya estás autenticado</h2>
            <p className="text-gray-400 mb-4">Redirigiendo al panel de administración...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4">
      <NodeBackground />
      <Card className="relative z-10 w-full max-w-md bg-black border-zinc-800 hover:border-blue-500/30 transition-all duration-300">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Acceso Administrativo
          </CardTitle>
          <p className="text-gray-400">Área restringida - Solo administradores</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/50 border border-green-700 text-green-400 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="pt-4 border-t border-zinc-800 text-center">
            <Link 
              href="/"
              className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
            >
              ← Volver al portfolio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}