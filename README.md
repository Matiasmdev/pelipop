# 🍿 PeliPop

**PeliPop** es una aplicación moderna de descubrimiento de películas que permite a los usuarios encontrar sus títulos favoritos sin esfuerzo, explorar las tendencias actuales y descubrir nuevas recomendaciones.

## 🚀 Características
- **Buscador Inteligente**: Encuentra cualquier película mediante la base de datos de TMDB.
- **Top Tendencias**: Visualiza las 5 películas más buscadas por la comunidad en tiempo real.
- **Diseño Premium**: Interfaz oscura con estética cinematográfica y efectos de neón.
- **Rate Limiting**: Protección integrada para gestionar las llamadas a la API de forma eficiente.

## 🛠️ Tecnologías
- **React**: Biblioteca principal para la interfaz de usuario.
- **Appwrite**: Backend-as-a-Service para la gestión de la base de datos y tendencias.
- **TMDB API**: Fuente de datos para el catálogo de películas.
- **Tailwind CSS**: Estilizado moderno y responsivo.
- **Vite**: Herramienta de construcción rápida para el desarrollo.

## 💻 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Matiasmdev/pelipop.git
   cd pelipop
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales:
   ```env
   VITE_TMDB_API_KEY=tu_api_key_aquí
   VITE_APPWRITE_PROJECT_ID=tu_project_id
   VITE_APPWRITE_DATABASE_ID=tu_database_id
   VITE_APPWRITE_COLLECTION_ID=tu_collection_id
   ```

4. **Iniciar en desarrollo**:
   ```bash
   npm run dev
   ```

---
Creado por [Matiasmdev](https://github.com/Matiasmdev)
