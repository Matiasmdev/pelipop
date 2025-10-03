# 🎬 Peliverse - Buscador Inteligente de Películas

Aplicación web para buscar películas en tiempo real usando la API de TMDB, con sistema de trending que muestra las 5 películas más buscadas por los usuarios.

![Peliverse](./public/nuevologo.png)

## ✨ ¿Qué hace?

Peliverse te permite buscar cualquier película y ver información detallada como rating, año de lanzamiento e idioma. Además, muestra un **Top 5** de las películas más buscadas por todos los usuarios en tiempo real.

## 🎯 Características Principales

### 🔍 Búsqueda Optimizada con Debounce
- **Problema**: Sin debounce, cada letra que escribes genera una llamada a la API
- **Solución**: Espera 500ms después de que dejes de escribir para hacer la búsqueda
- **Ventaja**: Reduce las llamadas a la API en un 87.5% (de 8 llamadas a 1 por palabra)

**Ejemplo:**
```
Usuario escribe "Avengers" (8 letras)
❌ Sin debounce: 8 llamadas a la API
✅ Con debounce: 1 llamada a la API
```

### 🔥 Top 5 Trending
- Cada búsqueda se registra en Appwrite (base de datos)
- Las películas más buscadas suben automáticamente al Top 5
- Se actualiza en tiempo real según las búsquedas de todos los usuarios
- Muestra qué películas son populares en este momento

## 🛠️ Tecnologías

- **React 19** + **Vite 6** - Framework moderno y rápido
- **TailwindCSS 4.0** - Estilos utility-first
- **TMDB API** - Base de datos de películas
- **Appwrite** - Backend para tracking de búsquedas y trending
- **react-use** - Hook de debounce

## 🚀 Instalación Rápida

```bash
# 1. Clonar e instalar
git clone <tu-repositorio>
cd surflix
npm install

# 2. Configurar variables de entorno
# Crea .env.local con tu API key de TMDB
VITE_TMDB_API_KEY=tu_api_key

# 3. Iniciar
npm run dev
```

---

**Hecho con ❤️ usando React y Vite**

### Implementación en Surflix

```javascript
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

// Espera 500ms después de que el usuario deje de escribir
useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
```

### Beneficios

| Sin Debounce | Con Debounce (500ms) |
|--------------|----------------------|
| Usuario escribe "Avengers" (8 letras) | Usuario escribe "Avengers" (8 letras) |
| **8 llamadas a la API** | **1 llamada a la API** |
| Mayor costo de API | Menor costo de API |
| Mayor latencia percibida | Mejor experiencia de usuario |
| Posible rate limiting | Evita rate limiting |

### Ejemplo Real

```
Usuario escribe: A-v-e-n-g-e-r-s

❌ Sin debounce:
API call → "A"
API call → "Av"
API call → "Ave"
API call → "Aven"
API call → "Aveng"
API call → "Avenge"
API call → "Avenger"
API call → "Avengers"
Total: 8 llamadas

✅ Con debounce (500ms):
Usuario escribe... (esperando)
Usuario termina de escribir
Espera 500ms
API call → "Avengers"
Total: 1 llamada
```

### Ahorro de Costos

- **Reducción de ~87.5%** en llamadas a la API
- Mejor uso de rate limits
- Menor carga en servidores
- Experiencia de usuario más fluida

## 🛡️ Sistema de Rate Limiting

### ¿Por qué es necesario?

Aunque el debounce reduce significativamente las llamadas a la API, **no protege contra usuarios que hagan múltiples búsquedas consecutivas**. Sin rate limiting, cualquier persona podría:

- Hacer cientos de búsquedas en minutos
- Agotar tu cuota de API de TMDB
- Generar costos innecesarios
- Afectar el servicio para otros usuarios

### Implementación

Surflix implementa un **rate limiter del lado del cliente** que:

```javascript
// Hook personalizado useRateLimit
const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
  useRateLimit(50, 7200000); // 50 búsquedas cada 2 horas

// Antes de cada búsqueda
if (!canMakeRequest) {
  setErrorMessage(`Has alcanzado el límite de búsquedas...`);
  return;
}

// Después de una búsqueda exitosa
makeRequest(); // Registra la búsqueda
```

### Características del Rate Limiter

| Característica | Descripción |
|----------------|-------------|
| **Límite** | 50 búsquedas cada 2 horas |
| **Ventana deslizante** | Se resetea automáticamente después de 2 horas |
| **Persistencia** | Usa `localStorage` - persiste entre recargas |
| **Indicador visual** | Muestra búsquedas restantes en tiempo real |
| **Alertas** | Avisa cuando quedan pocas búsquedas |
| **Auto-reset** | Se limpia automáticamente cada 5 segundos |

### Flujo de Protección

```
Usuario hace búsqueda
        ↓
¿Puede hacer request? (canMakeRequest)
        ↓
    ┌───┴───┐
   NO      SÍ
    ↓       ↓
Mostrar   Hacer
mensaje   búsqueda
de error     ↓
          Registrar
          request
             ↓
          Actualizar
          contador
```

### Ejemplo de Uso Real

```
Búsqueda #1: "Iron Man" ✅ (19 restantes)
Búsqueda #2: "Thor" ✅ (18 restantes)
...
Búsqueda #20: "Hulk" ✅ (0 restantes)
Búsqueda #21: "Spider-Man" ❌ 
  → "Has alcanzado el límite. Resetea en 45 segundos"
```

### Ventajas

✅ **Protege tu cuota de API** - Evita que usuarios abusen del servicio
✅ **Experiencia justa** - Todos los usuarios tienen acceso equitativo
✅ **Costos controlados** - Máximo 50 búsquedas cada 2 horas por usuario
✅ **Sin backend** - Implementado completamente en el cliente
✅ **Transparente** - Los usuarios ven cuántas búsquedas les quedan

### Limitaciones

⚠️ **Basado en cliente**: Un usuario técnico podría limpiar el localStorage
⚠️ **Por navegador**: Cada navegador/dispositivo tiene su propio límite
⚠️ **No es infalible**: Para protección total, necesitarías rate limiting en el backend

### ¿Es suficiente para una demo?

**SÍ**, para demostrar conocimientos de API calls es más que suficiente porque:

1. Protege contra uso normal/accidental excesivo
2. Demuestra buenas prácticas de optimización
3. Muestra conocimiento de UX (indicadores visuales)
4. Es una solución pragmática para una app de portfolio

Para producción con usuarios reales, considerarías:
- Rate limiting en el backend
- Autenticación de usuarios
- API keys por usuario
- Monitoreo de uso

## 📁 Estructura del Proyecto

```
surflix/
├── public/
│   ├── logocinee.png      # Logo de la aplicación
│   ├── hero.png           # Imagen hero
│   ├── search.svg         # Icono de búsqueda
│   ├── star.svg           # Icono de rating
│   └── no-movie.png       # Placeholder para películas sin poster
├── src/
│   ├── components/
│   │   ├── MovieCard.jsx  # Tarjeta de película
│   │   ├── Search.jsx     # Componente de búsqueda
│   │   └── Spinner.jsx    # Indicador de carga
│   ├── hooks/
│   │   └── useRateLimit.js # Hook de rate limiting
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   ├── App.css            # Estilos de la app
│   └── index.css          # Estilos globales
├── appwrite.js            # Configuración de Appwrite
├── .env.local             # Variables de entorno (no subir a git)
├── .env.example           # Ejemplo de variables de entorno
├── vercel.json            # Configuración de Vercel
├── vite.config.js         # Configuración de Vite
└── package.json           # Dependencias del proyecto
```

## 🔒 Seguridad

### Variables de Entorno

- ✅ `.env.local` está en `.gitignore`
- ✅ Las API keys nunca se suben al repositorio
- ✅ Usa `.env.example` como plantilla
- ✅ En Vercel, configura las variables en el dashboard

### API Keys en el Bundle

Las variables `VITE_*` son seguras porque:
1. Se procesan en **build time**, no en runtime
2. Vite las reemplaza por sus valores durante la compilación
3. No hay forma de extraer la variable original del bundle
4. El código resultante es JavaScript estático

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Previsualiza el build de producción
npm run lint     # Ejecuta ESLint
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🙏 Agradecimientos

- [TMDB](https://www.themoviedb.org/) por su excelente API de películas
- [Appwrite](https://appwrite.io/) por el backend as a service
- [Vite](https://vitejs.dev/) por el increíble build tool
- [TailwindCSS](https://tailwindcss.com/) por el framework de CSS

## 📧 Contacto

Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.

---

**Hecho con ❤️ y React**
