'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

export default function useSecretAccess() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {      // Check the specific combination: Ctrl + Shift + L
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();        console.log('🔑 Acceso secreto detectado - Redirigiendo al login...');
          // Show temporary visual notification
        const notification = document.createElement('div');
        notification.innerHTML = t.secretAccess.notification;
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          transform: translateX(100%);
          opacity: 0;
        `;
        
        document.body.appendChild(notification);        
        // Animate entrance
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
          notification.style.opacity = '1';
        }, 10);
          // Remove notification and redirect
        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          notification.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
            router.push('/login');
          }, 300);
        }, 1500);
      }
    };    // Add event listener
    window.addEventListener('keydown', handleKeyDown);    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, language, t]);
}
