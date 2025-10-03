# ⚡ Quick Start - Deploy en 5 Minutos

## 🎯 Comandos Rápidos

### 1️⃣ Verificar que todo funciona localmente

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:5173 y verifica:
- ✅ La app carga
- ✅ Puedes buscar películas
- ✅ El contador de búsquedas funciona

---

### 2️⃣ Preparar para Git

```bash
# Inicializar git (si no lo hiciste)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "feat: Surflix with rate limiting and API optimization"

# Ver el estado
git status
```

---

### 3️⃣ Subir a GitHub

```bash
# Crear repositorio en GitHub primero, luego:
git remote add origin https://github.com/TU-USUARIO/surflix.git
git branch -M main
git push -u origin main
```

---

### 4️⃣ Deploy en Vercel

#### Opción A: Desde la Web (Más Fácil)

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es Vite
5. **IMPORTANTE**: Agrega las variables de entorno:
   - `VITE_TMDB_API_KEY`
   - `VITE_APPWRITE_PROJECT_ID`
   - `VITE_APPWRITE_DATABASE_ID`
   - `VITE_APPWRITE_COLLECTION_ID`
6. Click en "Deploy"
7. ¡Espera 1-2 minutos y listo! 🎉

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Agregar variables de entorno
vercel env add VITE_TMDB_API_KEY production
vercel env add VITE_APPWRITE_PROJECT_ID production
vercel env add VITE_APPWRITE_DATABASE_ID production
vercel env add VITE_APPWRITE_COLLECTION_ID production

# Deploy a producción
vercel --prod
```

---

## 🔑 Obtener API Keys

### TMDB API Key

1. Ve a [themoviedb.org](https://www.themoviedb.org/)
2. Crea una cuenta (gratis)
3. Ve a Settings → API
4. Solicita una API key (selecciona "Developer")
5. Copia el **Bearer Token** (no la API Key v3)

### Appwrite (Opcional)

1. Ve a [cloud.appwrite.io](https://cloud.appwrite.io/)
2. Crea un proyecto
3. Crea una base de datos
4. Crea una colección con estos atributos:
   - `searchTerm` (string)
   - `count` (integer)
   - `movie_id` (integer)
   - `poster_url` (string)
5. Copia los IDs necesarios

---

## 🧪 Testing Rápido

### Probar Rate Limiting

```javascript
// Abre la consola del navegador (F12) y ejecuta:

// Hacer 25 búsquedas rápidas
for (let i = 0; i < 25; i++) {
  console.log(`Intento ${i + 1}`);
  // Busca manualmente cada vez
}

// Resultado esperado:
// - Primeras 20: ✅ Funcionan
// - Últimas 5: ❌ Bloqueadas
```

### Verificar Seguridad

```javascript
// En DevTools → Application → Local Storage
console.log(localStorage.getItem('surflix_rate_limit'));

// Deberías ver algo como:
// {"requests":[timestamp1, timestamp2, ...],"resetTime":...}
```

### Limpiar Rate Limit (para testing)

```javascript
// En consola del navegador:
localStorage.removeItem('surflix_rate_limit');
location.reload();
```

---

## 📊 Verificar Deployment

Después del deploy, verifica:

### ✅ Checklist Post-Deploy

```
□ La app carga en la URL de Vercel
□ Puedes buscar películas
□ Las imágenes cargan correctamente
□ El contador de búsquedas funciona
□ Después de 20 búsquedas, se bloquea
□ El trending muestra películas
□ No hay errores en la consola
```

### 🔍 Verificar Seguridad

```
□ Abre DevTools → Sources
□ Busca en los archivos .js
□ NO debe aparecer "VITE_TMDB_API_KEY"
□ NO debe aparecer "import.meta.env"
```

---

## 🐛 Troubleshooting Rápido

### Error: "API key is undefined"

**Solución**: Las variables de entorno no están configuradas en Vercel
```bash
# Ve a Vercel Dashboard → Settings → Environment Variables
# Agrega todas las variables VITE_*
# Redeploy
```

### Error: "Failed to fetch movies"

**Solución**: API key inválida
```bash
# Verifica tu API key en TMDB
# Asegúrate de usar el Bearer Token, no la API Key v3
# Actualiza en Vercel y redeploy
```

### Las imágenes no cargan

**Solución**: Problema con rutas
```bash
# Verifica que las imágenes estén en public/
# Usa rutas absolutas: /logo.png no ./logo.png
```

### El rate limiting no funciona

**Solución**: localStorage bloqueado
```bash
# Verifica que el navegador permita localStorage
# Prueba en modo normal (no incógnito)
# Limpia el localStorage y recarga
```

---

## 📝 Comandos Útiles

### Desarrollo

```bash
# Iniciar dev server
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Git

```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Commit
git commit -m "tu mensaje"

# Push
git push

# Ver historial
git log --oneline
```

### Vercel

```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs

# Ver variables de entorno
vercel env ls

# Remover deployment
vercel rm [deployment-url]
```

---

## 🎨 Personalización Rápida

### Cambiar el límite de búsquedas

```javascript
// src/App.jsx línea 29
// De 20 búsquedas/minuto a 30:
const { canMakeRequest, makeRequest, remainingRequests, timeUntilReset } = 
  useRateLimit(30, 60000); // Cambia 20 → 30
```

### Cambiar el tiempo de debounce

```javascript
// src/App.jsx línea 31
// De 500ms a 300ms:
useDebounce(() => setDebouncedSearchTerm(searchTerm), 300, [searchTerm]);
```

### Cambiar colores del rate limiter

```css
/* src/App.css línea 45 */
.rate-limit-info {
  background: rgba(255, 100, 100, 0.1); /* Cambia el color */
  border: 1px solid rgba(255, 100, 100, 0.3);
}
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **README.md** - Documentación general
- **DEPLOYMENT.md** - Guía completa de deployment
- **SECURITY.md** - Análisis de seguridad
- **RATE_LIMITING.md** - Detalles técnicos del rate limiting
- **RESUMEN_FINAL.md** - Resumen ejecutivo

---

## 🎯 Resultado Esperado

Después de seguir estos pasos, tendrás:

✅ App deployada en Vercel
✅ URL pública funcionando
✅ Rate limiting activo
✅ API keys protegidas
✅ Listo para agregar a tu portfolio

---

## 🚀 URL de Ejemplo

Tu app estará disponible en algo como:
```
https://surflix-tu-usuario.vercel.app
```

---

## 💡 Tips Finales

1. **Agrega la URL a tu README**
   ```markdown
   ## 🌐 Demo
   [Ver demo en vivo](https://tu-app.vercel.app)
   ```

2. **Agrega screenshots**
   - Toma capturas de la app funcionando
   - Agrégalas al README

3. **Comparte en redes**
   - LinkedIn: "Acabo de deployar Surflix..."
   - GitHub: Pin el repositorio
   - Portfolio: Agrega el proyecto

4. **Monitorea el uso**
   - Revisa Vercel Analytics
   - Monitorea el uso de TMDB API
   - Verifica logs si hay errores

---

## ⏱️ Tiempo Estimado

- Configuración local: **2 minutos**
- Git y GitHub: **2 minutos**
- Deploy en Vercel: **1 minuto**
- **Total: ~5 minutos** ⚡

---

**¡Listo! Tu app está en producción.** 🎉

Si tienes problemas, revisa la documentación completa o los logs de Vercel.
