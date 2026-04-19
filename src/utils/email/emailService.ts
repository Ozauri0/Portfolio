// Servicio de email — proxy hacia el Route Handler server-side (VUL-020)
// Las claves de EmailJS ya NO se exponen en el bundle del cliente

/** @deprecated Usar sendEmail() directamente. initEmailJS ya no es necesario. */
export const initEmailJS = (): void => {
  // No-op: EmailJS ahora se llama desde el servidor
};

// Enviar email a través del route handler /api/contact
export const sendEmail = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { success: false, message: json.error || 'Error al enviar el mensaje.' };
    }

    return { success: true, message: json.message };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return { success: false, message: 'Error de conexión.' };
  }
};
