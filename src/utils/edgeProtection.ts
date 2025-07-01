
import React from 'react';

// ✅ SISTEMA DE DETECÇÃO DE BORDA GLOBAL REUTILIZÁVEL

export interface EdgeThresholds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const DEFAULT_EDGE_THRESHOLDS: EdgeThresholds = {
  top: 20,    // 20px do topo
  bottom: 20, // 20px da base
  left: 30,   // 30px da esquerda
  right: 30   // 30px da direita
};

/**
 * Detecta se um toque está nas extremidades perigosas da tela
 */
export const isEdgeTouchDangerous = (
  clientX: number, 
  clientY: number, 
  thresholds: EdgeThresholds = DEFAULT_EDGE_THRESHOLDS
): boolean => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  const isLeftEdge = clientX < thresholds.left;
  const isRightEdge = clientX > screenWidth - thresholds.right;
  const isTopEdge = clientY < thresholds.top;
  const isBottomEdge = clientY > screenHeight - thresholds.bottom;
  
  return isLeftEdge || isRightEdge || isTopEdge || isBottomEdge;
};

/**
 * Aplica proteção contra edge touches em um elemento
 */
export const applyEdgeProtection = (
  element: HTMLElement,
  onEdgeTouch?: (clientX: number, clientY: number) => void,
  thresholds?: EdgeThresholds
) => {
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch && isEdgeTouchDangerous(touch.clientX, touch.clientY, thresholds)) {
      console.log('🚫 Edge touch bloqueado:', { x: touch.clientX, y: touch.clientY });
      e.preventDefault();
      e.stopPropagation();
      onEdgeTouch?.(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch && isEdgeTouchDangerous(touch.clientX, touch.clientY, thresholds)) {
      console.log('🚫 Edge move bloqueado:', { x: touch.clientX, y: touch.clientY });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });

  // Retorna função de cleanup
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
  };
};

/**
 * Hook React para aplicar proteção de borda
 */
export const useEdgeProtection = (
  ref: React.RefObject<HTMLElement>,
  enabled: boolean = true,
  thresholds?: EdgeThresholds
) => {
  React.useEffect(() => {
    if (!enabled || !ref.current) return;

    return applyEdgeProtection(ref.current, undefined, thresholds);
  }, [enabled, ref, thresholds]);
};
