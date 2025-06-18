'use client';

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { initEmailJS, sendEmail } from "@/utils/email/emailService";
import { canSendEmail, recordEmailSent, getTimeRemaining } from "@/utils/email/spamProtection";

export default function ContactForm() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const formRef = useRef<HTMLFormElement>(null);

  // Estado del formulario
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Estado para rastrear el tiempo de espera y mensaje anti-spam
  const [waitTime, setWaitTime] = useState<string>('');
  const [spamError, setSpamError] = useState<boolean>(false);
  const waitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar EmailJS
  useEffect(() => {
    initEmailJS();
  }, []);

  // Efecto para inicializar y limpiar el temporizador
  useEffect(() => {
    // Comprueba si hay un tiempo de espera activo al cargar
    if (!canSendEmail()) {
      updateWaitTimer();
    }
    
    return () => {
      if (waitTimerRef.current) {
        clearInterval(waitTimerRef.current);
      }
    };
  }, []);
  // Function to update wait timer
  const updateWaitTimer = () => {
    // Limpiar temporizador existente si hay alguno
    if (waitTimerRef.current) {
      clearInterval(waitTimerRef.current);
    }
    
    // Actualiza el tiempo inmediatamente
    setWaitTime(getTimeRemaining());
    
    // Configura un intervalo para actualizar cada segundo
    waitTimerRef.current = setInterval(() => {
      const remaining = getTimeRemaining();
      setWaitTime(remaining);
      
      // Si el tiempo ha expirado, limpia el intervalo
      if (remaining === '0:00') {
        if (waitTimerRef.current) {
          clearInterval(waitTimerRef.current);
          waitTimerRef.current = null;
        }
        setWaitTime('');
        setSpamError(false);
      }
    }, 1000);
  };
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return;
    }    
    // Check anti-spam limit
    if (!canSendEmail()) {
      setFormStatus('error');
      setSpamError(true);
      updateWaitTimer();
      setTimeout(() => setFormStatus('idle'), 5000);
      return;
    }    setFormStatus('loading');
    
    const result = await sendEmail(formData);
      if (result.success) {
      // Record successful sending
      recordEmailSent();
      setFormStatus('success');
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } else {
      setFormStatus('error');
      setSpamError(false);    }
    
    // Reset after 5 seconds
    setTimeout(() => setFormStatus('idle'), 5000);
  };

  return (
    <>
      {formStatus === 'success' ? (
        <div className="bg-green-900/30 border border-green-500 rounded-md p-6 flex items-center gap-3 mb-8">
          <CheckCircle className="text-green-500 h-6 w-6" />
          <p className="text-white">{t.contact.successMessage}</p>
        </div>
      ) : formStatus === 'error' ? (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-6 flex items-center gap-3 mb-8">
          <AlertCircle className="text-red-500 h-6 w-6" />
          <p className="text-white">
            {spamError && waitTime ? 
              `${t.contact.errorMessage} ${waitTime}` : 
              t.contact.errorMessage}
          </p>
        </div>
      ) : null}

    <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-white">
          {t.contact.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name.split(' ')[0] || ''}
          onChange={(e) => {
            const lastName = formData.name.split(' ').slice(1).join(' ');
            setFormData(prev => ({
            ...prev,
            name: `${e.target.value} ${lastName}`.trim()
            }));
          }}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
          required
        />
        </div>
        <div className="space-y-2">
        <label htmlFor="lastName" className="text-sm font-medium text-white">
          {t.contact.lastname || "Last Name"}
        </label>
        <input
          id="lastName"
          type="text"
          value={formData.name.split(' ').slice(1).join(' ') || ''}
          onChange={(e) => {
            const firstName = formData.name.split(' ')[0] || '';
            setFormData(prev => ({
            ...prev,
            name: `${firstName} ${e.target.value}`.trim()
            }));
          }}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
          required
        />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-white">
        {t.contact.email}
        </label>
        <input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
        required
        />
      </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-white">
            {t.contact.subject}
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-white">
            {t.contact.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
            required
          ></textarea>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-white text-black hover:bg-gray-200" 
          disabled={formStatus === 'loading'}
        >
          {formStatus === 'loading' ? t.contact.sending : t.contact.send}
        </Button>
      </form>
    </>
  );
}