"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {

  onClick: () => void;
  /**
   * Posición vertical desde la que el botón comienza a mostrarse (en píxeles)
   * @default 300
   */
  showAfter?: number;
  
  /**
   * Texto para lectores de pantalla
   * @default "Volver al inicio"
   */
  srText?: string;
}

export function ScrollToTopButton({
  onClick,
  showAfter = 300,
  srText = "Volver al inicio",
}: ScrollToTopButtonProps) {
  // Estado para controlar la visibilidad y animación del botón
  const [visible, setVisible] = useState(false);
  const [buttonScaled, setButtonScaled] = useState(false);
  
  // Referencia para el temporizador de debounce
  const [scrollTimer, setScrollTimer] = useState<NodeJS.Timeout | null>(null);

  // Controlamos la visibilidad del botón basándonos en el scroll con debounce
  const handleScroll = useCallback(() => {
    // Limpiar el temporizador anterior si existe
    if (scrollTimer) clearTimeout(scrollTimer);
    
    // Crear un nuevo temporizador
    const timer = setTimeout(() => {
      const shouldShow = window.scrollY > showAfter;
      
      if (shouldShow && !visible) {
        // Si debe mostrarse y no está visible:
        // 1. Hacemos visible el botón primero (con escala 0)
        setVisible(true);
        
        // 2. Forzamos un reflow para asegurar que la transición funcione
        requestAnimationFrame(() => {
          // 3. Después aplicamos la escala para animar la entrada
          setButtonScaled(true);
        });
      } else if (!shouldShow && visible) {
        // Si no debe mostrarse y está visible:
        // 1. Primero quitamos la escala
        setButtonScaled(false);
        
        // 2. Después de la animación ocultamos el botón completamente
        setTimeout(() => {
          setVisible(false);
        }, 300); // Este tiempo debe coincidir con la duración de la transición
      }
    }, 150); // Aumentamos ligeramente el debounce para mayor estabilidad
    
    setScrollTimer(timer);
  }, [showAfter, visible, scrollTimer]);

  useEffect(() => {
    // Verificar el estado inicial de manera asíncrona para dar tiempo al navegador
    setTimeout(handleScroll, 100);
    
    // Agregar el evento de scroll
    window.addEventListener("scroll", handleScroll);
    
    // Limpieza
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [handleScroll, scrollTimer]);

  // Si no es visible, no renderizamos nada
  if (!visible) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <Button 
        onClick={onClick}
        size="icon" 
        className={`h-12 w-12 rounded-full shadow-lg bg-white text-black hover:bg-gray-200 
        transition-all duration-300 ${buttonScaled ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
      >
        <ArrowUp className="h-6 w-6" />
        <span className="sr-only">{srText}</span>
      </Button>
    </div>
  );
}