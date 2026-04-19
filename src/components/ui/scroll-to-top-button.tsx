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
  // State to control button visibility and animation
  const [visible, setVisible] = useState(false);
  const [buttonScaled, setButtonScaled] = useState(false);
  
  // Reference for debounce timer
  const [scrollTimer, setScrollTimer] = useState<NodeJS.Timeout | null>(null);

  // Control button visibility based on scroll with debounce
  const handleScroll = useCallback(() => {
    // Limpiar el temporizador anterior si existe
    if (scrollTimer) clearTimeout(scrollTimer);
    
    // Crear un nuevo temporizador
    const timer = setTimeout(() => {
      const shouldShow = window.scrollY > showAfter;
        if (shouldShow && !visible) {
        // If it should be shown and is not visible:
        // 1. Make the button visible first (with scale 0)
        setVisible(true);
        
        // 2. Force a reflow to ensure the transition works
        requestAnimationFrame(() => {
          // 3. Then apply scale to animate the entrance
          setButtonScaled(true);
        });
      } else if (!shouldShow && visible) {
        // If it should not be shown and is visible:
        // 1. First remove the scale        setButtonScaled(false);
        
        // 2. After the animation hide the button completely
        setTimeout(() => {
          setVisible(false);
        }, 300); // This time should match the transition duration
      }
    }, 150); // Slightly increase debounce for greater stability
    
    setScrollTimer(timer);
  }, [showAfter, visible, scrollTimer]);

  useEffect(() => {
    // Check initial state asynchronously to give time to the browser
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