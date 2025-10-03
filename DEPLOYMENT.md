# 🚀 Guía de Deployment en Vercel

## Pasos para Deployar Surflix en Vercel

### 1. Preparación del Proyecto

Asegúrate de que tu proyecto tenga estos archivos:
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.env.example` - Plantilla de variables de entorno
- ✅ `.gitignore` - Incluye `.env.local` y `*.local`

### 2. Subir a GitHub

```bash
# Inicializar repositorio (si no lo has hecho)
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit - Surflix app"

# Conectar con GitHub
git remote add origin https://github.com/tu-usuario/surflix.git

# Push
git push -u origin main
```

### 3. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite

### 4. Configurar Variables de Entorno

En la sección "Environment Variables" de Vercel, agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_TMDB_API_KEY` | Tu API key de TMDB | Requerido |
| `VITE_APPWRITE_PROJECT_ID` | Tu Project ID de Appwrite | Opcional |
| `VITE_APPWRITE_DATABASE_ID` | Tu Database ID | Opcional |
| `VITE_APPWRITE_COLLECTION_ID` | Tu Collection ID | Opcional |

**Importante**: Asegúrate de agregar estas variables en los tres ambientes:
- Production
- Preview
- Development

### 5. Deploy

Click en "Deploy" y espera a que termine el build (1-2 minutos).

### 6. Verificación Post-Deploy

Después del deploy, verifica:

1. **La app carga correctamente** ✅
2. **La búsqueda funciona** (prueba buscar "Avengers")
3. **Las imágenes se cargan** (posters de películas)
4. **El trending funciona** (si configuraste Appwrite)

### 7. Configuración de Dominio (Opcional)

1. Ve a "Settings" → "Domains"
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

## 🔍 Troubleshooting

### Error: "API key is undefined"

**Causa**: Las variables de entorno no están configuradas correctamente.

**Solución**:
1. Ve a Project Settings → Environment Variables
2. Verifica que `VITE_TMDB_API_KEY` esté configurada
3. Redeploy el proyecto

### Error: "Failed to fetch movies"

**Causa**: La API key de TMDB es inválida o ha expirado.

**Solución**:
1. Verifica tu API key en [TMDB Settings](https://www.themoviedb.org/settings/api)
2. Genera una nueva si es necesario
3. Actualiza la variable en Vercel
4. Redeploy

### Las imágenes no cargan

**Causa**: Problema con las rutas de los assets.

**Solución**:
1. Verifica que las imágenes estén en la carpeta `public/`
2. Las rutas deben ser absolutas: `/logocinee.png` no `./logocinee.png`
3. Redeploy

### El trending no funciona

**Causa**: Appwrite no está configurado o las credenciales son incorrectas.

**Solución**:
1. Verifica las variables de Appwrite en Vercel
2. Asegúrate de que la colección tenga los permisos correctos
3. En Appwrite Console → Database → Collection → Settings → Permissions:
   - Read: `Any`
   - Create: `Any`
   - Update: `Any`

## 🔒 Seguridad en Producción

### ✅ Variables de Entorno Seguras

Las variables `VITE_*` son procesadas en **build time**:

```javascript
// Código fuente
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Bundle final (después del build)
const API_KEY = "eyJhbGciOiJIUzI1NiJ9...";
```

**¿Por qué es seguro?**
- Vite reemplaza las variables durante la compilación
- No hay forma de extraer la variable original del bundle
- El bundle solo contiene valores estáticos de JavaScript

### ⚠️ Lo que NO debes hacer

❌ **NO** expongas API keys en el código:
```javascript
const API_KEY = "mi-api-key-secreta"; // ¡NUNCA!
```

❌ **NO** subas `.env.local` a GitHub

❌ **NO** uses variables sin el prefijo `VITE_` en el frontend

### ✅ Lo que SÍ debes hacer

✅ Usa `import.meta.env.VITE_*` para variables de entorno

✅ Mantén `.env.local` en `.gitignore`

✅ Usa `.env.example` como documentación

✅ Configura las variables en Vercel Dashboard

## 📊 Monitoreo

### Analytics de Vercel

Vercel proporciona analytics automáticos:
- Visitas por página
- Tiempo de carga
- Core Web Vitals
- Errores de runtime

Accede desde: Project → Analytics

### Logs

Para ver los logs de tu aplicación:
1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Selecciona un deployment
4. Click en "View Function Logs"

## 🔄 Continuous Deployment

Vercel automáticamente:
- ✅ Hace deploy en cada push a `main`
- ✅ Crea preview deployments para PRs
- ✅ Ejecuta los tests (si los tienes configurados)
- ✅ Optimiza el bundle automáticamente

### Configurar Branch Deployments

1. Settings → Git
2. Configura qué branches hacen deploy automático
3. Configura preview deployments para PRs

## 🎯 Optimizaciones Adicionales

### 1. Configurar Headers de Cache

Edita `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Habilitar Compression

Vercel habilita Gzip y Brotli automáticamente, pero puedes verificarlo en:
- Settings → General → Compression

### 3. Configurar Redirects

Si necesitas redirects, agrégalos en `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

## 📈 Métricas de Performance

Después del deploy, verifica:

- **Lighthouse Score**: Debe ser >90
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Bundle Size**: <500KB

Usa [PageSpeed Insights](https://pagespeed.web.dev/) para analizar tu sitio.

## 🆘 Soporte

Si tienes problemas:

1. **Documentación de Vercel**: [vercel.com/docs](https://vercel.com/docs)
2. **Comunidad de Vercel**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **Soporte de TMDB**: [themoviedb.org/talk](https://www.themoviedb.org/talk)

---

**¡Feliz deployment! 🚀**
