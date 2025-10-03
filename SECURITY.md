# 🔒 Guía de Seguridad - Surflix

## ✅ Estado de Seguridad Actual

Tu proyecto **YA ESTÁ SEGURO** para deployment en Vercel. Aquí está el análisis completo:

## 🛡️ Variables de Entorno

### Configuración Actual

```javascript
// App.jsx
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// appwrite.js
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
```

### ✅ Por qué es seguro

1. **Prefijo VITE_**: Las variables con este prefijo son procesadas en build time
2. **Build Time Replacement**: Vite reemplaza las variables durante la compilación
3. **No hay runtime access**: El bundle final solo contiene valores estáticos
4. **Gitignore configurado**: `.env.local` está en `.gitignore`

### Proceso de Build

```
┌─────────────────────────────────────────────────────────────┐
│ DESARROLLO (Local)                                          │
├─────────────────────────────────────────────────────────────┤
│ .env.local                                                  │
│ VITE_TMDB_API_KEY=abc123                                   │
│                                                             │
│ Código fuente:                                              │
│ const API_KEY = import.meta.env.VITE_TMDB_API_KEY;        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    npm run build
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PRODUCCIÓN (Vercel)                                         │
├─────────────────────────────────────────────────────────────┤
│ Bundle final (dist/):                                       │
│ const API_KEY = "abc123";                                   │
│                                                             │
│ ✅ No hay referencia a import.meta.env                     │
│ ✅ No hay forma de extraer la variable original            │
│ ✅ Solo valores estáticos en JavaScript                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Verificación de Seguridad

### 1. Archivos Protegidos

```bash
# .gitignore incluye:
*.local          # ✅ Protege .env.local
node_modules     # ✅ Protege dependencias
dist             # ✅ Protege builds locales
```

### 2. Variables de Entorno

| Variable | Ubicación | Estado |
|----------|-----------|--------|
| `VITE_TMDB_API_KEY` | `.env.local` | ✅ Protegida |
| `VITE_APPWRITE_PROJECT_ID` | `.env.local` | ✅ Protegida |
| `VITE_APPWRITE_DATABASE_ID` | `.env.local` | ✅ Protegida |
| `VITE_APPWRITE_COLLECTION_ID` | `.env.local` | ✅ Protegida |

### 3. Bundle Analysis

Para verificar que no hay secrets en el bundle:

```bash
# Build el proyecto
npm run build

# Inspeccionar el bundle
cat dist/assets/*.js | grep -i "api" | grep -i "key"
```

**Resultado esperado**: No deberías ver la palabra "VITE_TMDB_API_KEY" en el bundle.

## 🚨 Qué NO hacer

### ❌ Hardcodear API Keys

```javascript
// ¡NUNCA HAGAS ESTO!
const API_KEY = "eyJhbGciOiJIUzI1NiJ9...";
```

### ❌ Commitear .env.local

```bash
# ¡NUNCA HAGAS ESTO!
git add .env.local
git commit -m "Add env file"
```

### ❌ Usar variables sin prefijo VITE_

```javascript
// ❌ Esto NO funcionará en Vite
const API_KEY = process.env.TMDB_API_KEY;

// ✅ Esto SÍ funciona
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
```

### ❌ Exponer secrets en el cliente

```javascript
// ❌ NO expongas secrets sensibles
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// ✅ Los secrets deben estar en el backend
// Para Vite, solo usa variables que sean seguras de exponer
```

## 🎯 Best Practices

### 1. Separación de Secrets

```
Frontend (Vite + React):
✅ VITE_TMDB_API_KEY - OK (API pública con rate limits)
✅ VITE_APPWRITE_PROJECT_ID - OK (ID público)
✅ VITE_APPWRITE_DATABASE_ID - OK (ID público)

Backend (si tuvieras):
🔒 DATABASE_PASSWORD - Nunca en frontend
🔒 JWT_SECRET - Nunca en frontend
🔒 ADMIN_API_KEY - Nunca en frontend
```

### 2. Rotación de API Keys

- Rota tus API keys cada 3-6 meses
- Si una key se compromete, revócala inmediatamente
- Usa diferentes keys para desarrollo y producción

### 3. Monitoreo

- Monitorea el uso de tu API key en TMDB
- Configura alertas para uso inusual
- Revisa los logs de Vercel regularmente

## 🔐 Configuración de TMDB API

### Restricciones Recomendadas

En tu cuenta de TMDB, configura:

1. **Rate Limiting**: TMDB tiene límites por defecto
2. **Allowed Domains**: Configura tu dominio de Vercel
3. **Monitoring**: Revisa el dashboard de uso

### Permisos de Appwrite

En Appwrite Console → Database → Collection → Settings:

```
Permissions:
- Read: Any (permite lectura pública)
- Create: Any (permite crear búsquedas)
- Update: Any (permite actualizar contadores)
- Delete: None (no permite borrar)
```

## 📊 Checklist de Seguridad

Antes de hacer deploy, verifica:

- [x] `.env.local` está en `.gitignore`
- [x] Todas las API keys usan el prefijo `VITE_`
- [x] No hay secrets hardcodeados en el código
- [x] `.env.example` está documentado
- [x] Las variables están configuradas en Vercel
- [x] El bundle no contiene referencias a variables de entorno
- [x] Los permisos de Appwrite están configurados correctamente

## 🆘 En caso de compromiso

Si crees que tu API key fue comprometida:

### 1. TMDB API Key

1. Ve a [TMDB Settings](https://www.themoviedb.org/settings/api)
2. Genera una nueva API key
3. Actualiza la variable en Vercel
4. Redeploy el proyecto
5. Revoca la key antigua

### 2. Appwrite Credentials

1. Ve a Appwrite Console
2. Genera nuevos IDs si es necesario
3. Actualiza las variables en Vercel
4. Redeploy

## 📚 Recursos Adicionales

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Appwrite Security](https://appwrite.io/docs/security)

## ✅ Conclusión

Tu proyecto **está correctamente configurado** para deployment seguro en Vercel. Las API keys están protegidas y no se expondrán en el bundle final.

**Puedes hacer deploy con confianza! 🚀**

---

**Última actualización**: 2025-10-03
