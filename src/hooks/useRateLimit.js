import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para rate limiting de búsquedas
 * Limita el número de búsquedas que un usuario puede hacer en un período de tiempo
 * 
 * @param {number} maxRequests - Número máximo de requests permitidos
 * @param {number} timeWindow - Ventana de tiempo en milisegundos
 * @returns {Object} - { canMakeRequest, makeRequest, remainingRequests, resetTime }
 */
const useRateLimit = (maxRequests = 20, timeWindow = 60000) => {
  const STORAGE_KEY = 'surflix_rate_limit';
  
  const [state, setState] = useState(() => {
    // Intentar cargar el estado desde localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        
        // Si la ventana de tiempo ha expirado, resetear
        if (now >= parsed.resetTime) {
          return {
            requests: [],
            resetTime: now + timeWindow
          };
        }
        
        // Filtrar requests antiguos
        const validRequests = parsed.requests.filter(
          timestamp => now - timestamp < timeWindow
        );
        
        return {
          requests: validRequests,
          resetTime: parsed.resetTime
        };
      }
    } catch (error) {
      console.error('Error loading rate limit state:', error);
    }
    
    // Estado inicial
    return {
      requests: [],
      resetTime: Date.now() + timeWindow
    };
  });

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving rate limit state:', error);
    }
  }, [state]);

  // Limpiar requests antiguos periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setState(prevState => {
        // Si la ventana ha expirado, resetear completamente
        if (now >= prevState.resetTime) {
          return {
            requests: [],
            resetTime: now + timeWindow
          };
        }
        
        // Filtrar requests antiguos
        const validRequests = prevState.requests.filter(
          timestamp => now - timestamp < timeWindow
        );
        
        // Solo actualizar si hay cambios
        if (validRequests.length !== prevState.requests.length) {
          return {
            ...prevState,
            requests: validRequests
          };
        }
        
        return prevState;
      });
    }, 5000); // Revisar cada 5 segundos

    return () => clearInterval(interval);
  }, [timeWindow]);

  // Verificar si se puede hacer un request
  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    
    // Si la ventana ha expirado, permitir
    if (now >= state.resetTime) {
      return true;
    }
    
    // Contar requests válidos en la ventana actual
    const validRequests = state.requests.filter(
      timestamp => now - timestamp < timeWindow
    );
    
    return validRequests.length < maxRequests;
  }, [state, maxRequests, timeWindow]);

  // Registrar un nuevo request
  const makeRequest = useCallback(() => {
    const now = Date.now();
    
    setState(prevState => {
      // Si la ventana ha expirado, resetear
      if (now >= prevState.resetTime) {
        return {
          requests: [now],
          resetTime: now + timeWindow
        };
      }
      
      // Agregar el nuevo request
      return {
        ...prevState,
        requests: [...prevState.requests, now]
      };
    });
  }, [timeWindow]);

  // Calcular requests restantes
  const remainingRequests = useCallback(() => {
    const now = Date.now();
    
    // Si la ventana ha expirado, todos los requests están disponibles
    if (now >= state.resetTime) {
      return maxRequests;
    }
    
    // Contar requests válidos
    const validRequests = state.requests.filter(
      timestamp => now - timestamp < timeWindow
    );
    
    return Math.max(0, maxRequests - validRequests.length);
  }, [state, maxRequests, timeWindow]);

  // Tiempo hasta el reset (en segundos)
  const timeUntilReset = useCallback(() => {
    const now = Date.now();
    const diff = state.resetTime - now;
    return Math.max(0, Math.ceil(diff / 1000));
  }, [state.resetTime]);

  return {
    canMakeRequest: canMakeRequest(),
    makeRequest,
    remainingRequests: remainingRequests(),
    timeUntilReset: timeUntilReset(),
    resetTime: state.resetTime
  };
};

export default useRateLimit;
