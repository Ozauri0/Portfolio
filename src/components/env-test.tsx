'use client';

import { useEffect } from 'react';

const EnvTest = () => {
  useEffect(() => {
    console.log('🔍 Variables de entorno en el cliente:');
    console.log('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
    console.log('NEXT_PUBLIC_EMAILJS_SERVICE_ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID);
    console.log('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Variables de Entorno:</h3>
      <div>PUBLIC_KEY: {process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '✅' : '❌'}</div>
      <div>SERVICE_ID: {process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✅' : '❌'}</div>
      <div>TEMPLATE_ID: {process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ? '✅' : '❌'}</div>
      <div>API_URL: {process.env.NEXT_PUBLIC_API_URL ? '✅' : '❌'}</div>
    </div>
  );
};

export default EnvTest;
