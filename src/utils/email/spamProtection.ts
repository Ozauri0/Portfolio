// Function to check if an email can be sent (anti-spam limit)
export const canSendEmail = (): boolean => {
    try {
      const lastSentTime = localStorage.getItem('lastEmailSent');
      
      if (!lastSentTime) {
        return true; // Si nunca se ha enviado un correo, permitir
      }
      
      const lastTime = parseInt(lastSentTime, 10);
      const currentTime = Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutos en milisegundos
        // If more than 5 minutes have passed since the last sending, allow
      return currentTime - lastTime >= fiveMinutesInMs;    } catch (error) {
      // If there's any error accessing localStorage, allow by default
      console.error('Error accediendo a localStorage:', error);
      return true;
    }
  };  
  // Function to record email sending
  export const recordEmailSent = (): void => {
    try {
      localStorage.setItem('lastEmailSent', Date.now().toString());
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  };  
  // Function to get remaining time in readable format
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