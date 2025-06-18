import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key
export const initEmailJS = (): void => {
  const emailjsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  
  if (!emailjsPublicKey) {
    console.error('La clave pública de EmailJS no está configurada.');
    return;
  }
  
  emailjs.init(emailjsPublicKey);
};

// Send email
export const sendEmail = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    
    if (!serviceId || !templateId) {
      throw new Error('Faltan las configuraciones de EmailJS.');
    }

    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: data.name,
        reply_to: data.email,
        subject: data.subject || "Mensaje desde Portfolio",
        message: data.message
      }
    );
    
    return { success: true, message: result.text };
  } catch (error: any) {
    console.error('Error al enviar email:', error);
    console.error('Detalles del error:', JSON.stringify(error, null, 2));
    return { success: false, message: error.text || 'Error desconocido' };
  }
};