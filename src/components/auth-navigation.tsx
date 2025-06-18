'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { User, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AuthNavigation() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user, isAuthenticated, logout, isLoading } = useAuth();  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin on load
  React.useEffect(() => {
    if (isAuthenticated && user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [isAuthenticated, user]);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No token found');
        setIsAdmin(false);
        return;
      }

      console.log('Checking admin status with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Admin check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin check success:', data);
        setIsAdmin(true);
      } else {
        console.log('Admin check failed:', response.status);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    );
  }
  // Only show something if user is authenticated
  // The login button is completely hidden from the public
  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated && user ? (
        <div className="flex items-center space-x-3">          {/* Show user information */}
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <User className="h-4 w-4" />
            <span>Hola, {user.fullName || user.email}</span>
          </div>          {/* Admin button (only if admin) */}
          {isAdmin && (
            <Link href="/admin-access">
              <Button
                variant="outline"
                size="sm"
                className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
          )}          {/* Logout button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </div>
      ) : (        // Don't show anything if not authenticated
        // Access is completely secret
        <div></div>
      )}
    </div>
  );
}
