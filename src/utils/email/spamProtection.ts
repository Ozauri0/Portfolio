// Función para comprobar si se puede enviar un correo (límite anti-spam)
export const canSendEmail = (): boolean => {
    try {
      const lastSentTime = localStorage.getItem('lastEmailSent');
      
      if (!lastSentTime) {
        return true; // Si nunca se ha enviado un correo, permitir
      }
      
      const lastTime = parseInt(lastSentTime, 10);
      const currentTime = Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutos en milisegundos
      
      // Si han pasado más de 5 minutos desde el último envío, permitir
      return currentTime - lastTime >= fiveMinutesInMs;
    } catch (error) {
      // Si hay algún error accediendo a localStorage, permitir por defecto
      console.error('Error accediendo a localStorage:', error);
      return true;
    }
  };
  
  // Función para registrar el envío de un correo
  export const recordEmailSent = (): void => {
    try {
      localStorage.setItem('lastEmailSent', Date.now().toString());
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  };
  
  // Función para obtener el tiempo restante en formato legible
  export const getTimeRemaining = (): string => {
    try {
      const lastSentTime = localStorage.getItem('lastEmailSent');
      
      if (!lastSentTime) {
        return '0:00';
      }
      
      const lastTime = parseInt(lastSentTime, 10);
      const currentTime = Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000;
      const timeElapsed = currentTime - lastTime;
      
      if (timeElapsed >= fiveMinutesInMs) {
        return '0:00';
      }
      
      const timeRemaining = fiveMinutesInMs - timeElapsed;
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return '0:00';
    }
  };