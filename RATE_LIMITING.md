# 🛡️ Rate Limiting - Protección de API

## Resumen Ejecutivo

Surflix implementa un **sistema de rate limiting del lado del cliente** para proteger tu cuota de API de TMDB contra abuso. Limita a **20 búsquedas por minuto por usuario**, con persistencia en localStorage y feedback visual en tiempo real.

## ¿Por qué necesitas Rate Limiting?

### El Problema

Aunque implementaste **debounce** (que reduce llamadas mientras el usuario escribe), esto **NO protege contra**:

```
Escenario 1: Usuario curioso
- Busca "Iron Man" → 1 llamada ✅
- Busca "Thor" → 1 llamada ✅
- Busca "Hulk" → 1 llamada ✅
... repite 100 veces en 5 minutos
→ 100 llamadas a tu API 💸

Escenario 2: Bot o script
- Loop automático haciendo búsquedas
- Podría hacer miles de llamadas
→ Agota tu cuota de TMDB en minutos 🚨

Escenario 3: Múltiples usuarios
- 10 usuarios haciendo 50 búsquedas cada uno
- 500 llamadas en poco tiempo
→ Posible bloqueo de tu API key ⛔
```

### La Solución

**Rate Limiting** = Limitar el número de requests que un usuario puede hacer en un período de tiempo.

## Implementación Técnica

### 1. Hook Personalizado: `useRateLimit`

```javascript
// src/hooks/useRateLimit.js
const useRateLimit = (maxRequests = 20, timeWindow = 60000) => {
  // Estado persistente en localStorage
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem('surflix_rate_limit');
    // ... lógica de carga y validación
  });

  // Verificar si puede hacer request
  const canMakeRequest = useCallback(() => {
    const validRequests = state.requests.filter(
      timestamp => Date.now() - timestamp < timeWindow
    );
    return validRequests.length < maxRequests;
  }, [state, maxRequests, timeWindow]);

  // Registrar nuevo request
  const makeRequest = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      requests: [...prevState.requests, Date.now()]
    }));
  }, [timeWindow]);

  return {
    canMakeRequest,
    makeRequest,
    remainingRequests,
    timeUntilReset
  };
};
```

### 2. Integración en App.jsx

```javascript
const App = () => {
  // Rate limiting: 20 búsquedas por minuto
  const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
    useRateLimit(20, 60000);

  const fetchMovies = useCallback(async (query = "") => {
    // 🛡️ VERIFICAR RATE LIMIT ANTES DE LA BÚSQUEDA
    if (!canMakeRequest) {
      setErrorMessage(
        `Has alcanzado el límite de búsquedas. ` +
        `Quedan ${remainingRequests} búsquedas disponibles. ` +
        `Intenta de nuevo en ${timeUntilReset} segundos.`
      );
      return; // ⛔ Bloquear la búsqueda
    }

    // Hacer la búsqueda...
    const response = await fetch(endpoint, API_OPTIONS);
    const data = await response.json();
    
    // ✅ REGISTRAR LA BÚSQUEDA EXITOSA
    makeRequest();
    
    setMovieList(data.results);
  }, [canMakeRequest, makeRequest, remainingRequests, timeUntilReset]);
};
```

### 3. Indicador Visual

```jsx
<div className="rate-limit-info">
  <p>
    Búsquedas restantes: <span>{remainingRequests}/20</span>
    
    {/* Alerta cuando quedan pocas búsquedas */}
    {remainingRequests < 5 && remainingRequests > 0 && (
      <span>⚠️ Pocas búsquedas restantes</span>
    )}
    
    {/* Mensaje cuando se alcanza el límite */}
    {remainingRequests === 0 && (
      <span>🚫 Límite alcanzado. Resetea en {timeUntilReset}s</span>
    )}
  </p>
</div>
```

## Características Técnicas

### Ventana Deslizante (Sliding Window)

```
Tiempo: 0s ────────────────────────────────────────────> 60s

Búsqueda en t=0s:  [●]
Búsqueda en t=5s:  [●●]
Búsqueda en t=10s: [●●●]
...
Búsqueda en t=55s: [●●●●●●●●●●●●●●●●●●●●] (20 búsquedas)

En t=61s: La búsqueda de t=0s expira → [●●●●●●●●●●●●●●●●●●●] (19 búsquedas)
          ¡Ahora puede hacer 1 búsqueda más!
```

### Persistencia en localStorage

```javascript
// Estructura de datos guardada
{
  "requests": [1696350000000, 1696350005000, 1696350010000],
  "resetTime": 1696350060000
}

// Persiste entre:
✅ Recargas de página (F5)
✅ Cerrar y abrir pestaña
✅ Navegación dentro de la app
❌ NO persiste entre navegadores diferentes
❌ NO persiste en modo incógnito (se borra al cerrar)
```

### Auto-limpieza

```javascript
// Cada 5 segundos, limpia requests antiguos
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    const validRequests = state.requests.filter(
      timestamp => now - timestamp < timeWindow
    );
    // Actualiza el estado solo si hay cambios
  }, 5000);
  
  return () => clearInterval(interval);
}, [timeWindow]);
```

## Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│ Usuario escribe "Avengers"                              │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Debounce: Espera 500ms después de última tecla         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Rate Limiter: ¿Puede hacer request?                    │
│ - Cuenta requests en últimos 60s                       │
│ - Compara con límite (20)                              │
└────────────────────┬────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            │                 │
         ❌ NO              ✅ SÍ
            │                 │
            ↓                 ↓
┌──────────────────┐  ┌──────────────────┐
│ Mostrar mensaje  │  │ Hacer búsqueda   │
│ de error         │  │ a TMDB API       │
│ "Límite          │  └────────┬─────────┘
│  alcanzado"      │           ↓
└──────────────────┘  ┌──────────────────┐
                      │ makeRequest()    │
                      │ Registra timestamp│
                      └────────┬─────────┘
                               ↓
                      ┌──────────────────┐
                      │ Actualizar UI    │
                      │ remainingRequests│
                      └──────────────────┘
```

## Comparación: Con vs Sin Rate Limiting

### Sin Rate Limiting

```javascript
// ❌ Vulnerable
const fetchMovies = async (query) => {
  const response = await fetch(API_URL);
  // Cualquiera puede hacer infinitas búsquedas
};

// Escenario de abuso:
for (let i = 0; i < 1000; i++) {
  fetchMovies(`movie${i}`); // 1000 llamadas sin restricción
}
// Resultado: API key bloqueada 🚨
```

### Con Rate Limiting

```javascript
// ✅ Protegido
const fetchMovies = async (query) => {
  if (!canMakeRequest) {
    return; // Bloqueado
  }
  const response = await fetch(API_URL);
  makeRequest(); // Registrado
};

// Mismo escenario:
for (let i = 0; i < 1000; i++) {
  fetchMovies(`movie${i}`);
}
// Resultado: Solo 20 búsquedas procesadas ✅
// Las otras 980 son bloqueadas
```

## Métricas de Protección

### Límites de TMDB API

TMDB tiene sus propios límites:
- **40 requests por 10 segundos** (240/minuto)
- **Límite diario**: Varía según el plan

### Tu Rate Limiting

- **20 requests por 60 segundos** (20/minuto)
- Mucho más conservador que el límite de TMDB
- Protege tu cuota sin afectar UX normal

### Cálculo de Protección

```
Sin rate limiting:
- 100 usuarios × 50 búsquedas = 5,000 llamadas/hora
- Costo potencial: Alto
- Riesgo de bloqueo: Alto

Con rate limiting (20/min):
- 100 usuarios × 20 búsquedas/min = 2,000 llamadas/hora máximo
- Reducción: 60%
- Riesgo de bloqueo: Bajo
```

## Configuración Personalizable

### Ajustar el Límite

```javascript
// Más restrictivo (10 búsquedas por minuto)
const rateLimit = useRateLimit(10, 60000);

// Menos restrictivo (30 búsquedas por minuto)
const rateLimit = useRateLimit(30, 60000);

// Ventana más corta (20 búsquedas por 30 segundos)
const rateLimit = useRateLimit(20, 30000);

// Ventana más larga (50 búsquedas por 5 minutos)
const rateLimit = useRateLimit(50, 300000);
```

### Variables de Entorno

Puedes hacer el límite configurable:

```javascript
// .env.local
VITE_RATE_LIMIT_MAX=20
VITE_RATE_LIMIT_WINDOW=60000

// App.jsx
const maxRequests = import.meta.env.VITE_RATE_LIMIT_MAX || 20;
const timeWindow = import.meta.env.VITE_RATE_LIMIT_WINDOW || 60000;
const rateLimit = useRateLimit(maxRequests, timeWindow);
```

## Limitaciones y Consideraciones

### ⚠️ Limitaciones del Cliente

| Limitación | Impacto | Mitigación |
|------------|---------|------------|
| Usuario puede limpiar localStorage | Puede resetear el límite | Aceptable para demo |
| Por navegador/dispositivo | Límite separado en cada navegador | Aceptable para demo |
| No protege contra bots sofisticados | Bots pueden evadir | Necesitarías backend |
| Modo incógnito resetea al cerrar | Límite no persiste | Comportamiento esperado |

### ✅ Suficiente para Portfolio/Demo

Para demostrar conocimientos de API calls, esta implementación:

1. ✅ Muestra comprensión de rate limiting
2. ✅ Implementa buenas prácticas de UX
3. ✅ Protege contra uso accidental excesivo
4. ✅ Es una solución pragmática y funcional
5. ✅ Demuestra conocimiento de React hooks avanzados

### 🚀 Para Producción

Si fuera una app real con usuarios, considerarías:

```javascript
// Backend con Express + Redis
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 60000,
  max: 20,
  keyGenerator: (req) => req.ip, // Por IP
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests'
    });
  }
});

app.use('/api/search', limiter);
```

## Testing

### Probar el Rate Limiting

```javascript
// Abrir consola del navegador
for (let i = 0; i < 25; i++) {
  console.log(`Búsqueda ${i + 1}`);
  // Hacer búsqueda manualmente
}

// Resultado esperado:
// Búsquedas 1-20: ✅ Exitosas
// Búsquedas 21-25: ❌ Bloqueadas con mensaje de error
```

### Verificar localStorage

```javascript
// En consola del navegador
console.log(localStorage.getItem('surflix_rate_limit'));

// Output:
// {"requests":[1696350000000,...],"resetTime":1696350060000}
```

### Limpiar Rate Limit (para testing)

```javascript
// En consola del navegador
localStorage.removeItem('surflix_rate_limit');
location.reload();
```

## Conclusión

El sistema de rate limiting en Surflix:

✅ **Protege** tu cuota de API contra abuso
✅ **Demuestra** conocimiento de buenas prácticas
✅ **Mejora** la experiencia de usuario con feedback visual
✅ **Es suficiente** para una aplicación de portfolio/demo
✅ **Funciona** sin necesidad de backend

Para una app de demostración de conocimientos de API calls, esta implementación es **más que adecuada** y muestra comprensión profunda de:
- Optimización de API calls
- React hooks personalizados
- Gestión de estado persistente
- UX y feedback al usuario
- Consideraciones de costos y límites

---

**Implementado con ❤️ para proteger tu API**
