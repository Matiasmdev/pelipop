# 🔄 Cómo Resetear el Rate Limit

## Para Desarrollo Local

### Opción 1: Desde la Consola del Navegador (Más Rápido)

1. Abre tu app en el navegador
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**
4. Ejecuta este comando:

```javascript
localStorage.removeItem('surflix_rate_limit');
location.reload();
```

5. ¡Listo! Ahora tienes 50 búsquedas disponibles

### Opción 2: Página de Reset

1. Ve a: `http://localhost:5173/reset-rate-limit.html`
2. Haz clic en "Resetear Contador"
3. Serás redirigido automáticamente a la app

### Opción 3: Desde DevTools Application

1. Abre DevTools (`F12`)
2. Ve a la pestaña **Application**
3. En el menú izquierdo: **Storage** → **Local Storage**
4. Selecciona tu dominio (`http://localhost:5173`)
5. Busca la key `surflix_rate_limit`
6. Click derecho → **Delete**
7. Recarga la página (`F5`)

---

## Para Producción (Vercel)

### Si eres el dueño de la app:

Usa cualquiera de las opciones anteriores pero con tu URL de producción:
- `https://tu-app.vercel.app/reset-rate-limit.html`

### Si eres un recruiter/visitante:

**No necesitas resetear nada.** El límite es generoso:
- **50 búsquedas cada 2 horas**
- Suficiente para probar toda la funcionalidad
- Se resetea automáticamente después de 2 horas

---

## Verificar el Estado Actual

Para ver cuántas búsquedas te quedan:

```javascript
// En la consola del navegador
const state = JSON.parse(localStorage.getItem('surflix_rate_limit'));
console.log('Búsquedas realizadas:', state.requests.length);
console.log('Resetea en:', new Date(state.resetTime));
```

---

## Configuración Actual

| Parámetro | Valor |
|-----------|-------|
| **Límite de búsquedas** | 50 |
| **Ventana de tiempo** | 2 horas (7200 segundos) |
| **Alerta de pocas búsquedas** | Cuando quedan < 10 |
| **Persistencia** | localStorage (por navegador) |

---

## ¿Por qué estos valores?

### 50 búsquedas cada 2 horas es perfecto porque:

✅ **Para recruiters:**
- Pueden probar toda la funcionalidad sin preocuparse
- 50 búsquedas es más que suficiente para una demo
- 2 horas es tiempo de sobra para evaluar la app

✅ **Para protección de API:**
- Sigue protegiendo contra abuso masivo
- Un usuario no puede hacer miles de búsquedas
- Mantiene los costos bajo control

✅ **Para demostrar conocimientos:**
- Muestra que entiendes rate limiting
- Demuestra consideración por la UX
- Balance entre protección y usabilidad

---

## Cambiar los Límites (Solo para desarrollo)

Si quieres ajustar los límites, edita `src/App.jsx` línea 29:

```javascript
// Actual: 50 búsquedas cada 2 horas
const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
  useRateLimit(50, 7200000);

// Más generoso: 100 búsquedas cada 4 horas
const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
  useRateLimit(100, 14400000);

// Más restrictivo: 30 búsquedas cada 1 hora
const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
  useRateLimit(30, 3600000);

// Sin límite (solo para testing local)
const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
  useRateLimit(999999, 86400000);
```

---

## Troubleshooting

### "No puedo hacer búsquedas y dice que alcancé el límite"

**Causa:** El localStorage tiene un límite antiguo guardado.

**Solución:**
```javascript
localStorage.removeItem('surflix_rate_limit');
location.reload();
```

### "El contador no se actualiza"

**Causa:** Problema con el estado de React.

**Solución:**
1. Limpia el localStorage
2. Cierra y abre el navegador
3. Vuelve a entrar a la app

### "Quiero desactivar el rate limiting temporalmente"

**Solución:** Comenta las líneas en `src/App.jsx`:

```javascript
// const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
//   useRateLimit(50, 7200000);

// Y comenta la verificación en fetchMovies:
// if (!canMakeRequest) {
//   setErrorMessage(...);
//   return;
// }
```

---

## Para Recruiters

Si eres un recruiter probando esta app:

✅ **No necesitas hacer nada especial**
- Tienes 50 búsquedas disponibles
- Es más que suficiente para evaluar la funcionalidad
- El contador se muestra en la parte superior

✅ **Si por alguna razón alcanzas el límite:**
- Ve a `/reset-rate-limit.html`
- O abre la consola y ejecuta: `localStorage.removeItem('surflix_rate_limit'); location.reload();`

✅ **El límite es por navegador:**
- Puedes usar otro navegador si lo necesitas
- O modo incógnito (se resetea al cerrar)

---

## Comandos Rápidos

```javascript
// Ver estado actual
console.log(localStorage.getItem('surflix_rate_limit'));

// Resetear
localStorage.removeItem('surflix_rate_limit');
location.reload();

// Ver todas las keys de localStorage
console.log(Object.keys(localStorage));

// Limpiar todo el localStorage (cuidado!)
localStorage.clear();
```

---

**Configuración optimizada para demos y recruiters.** ✅
