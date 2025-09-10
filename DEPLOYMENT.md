# 🚀 Guía de Despliegue - Sistema de Reservas Hulux

## 📋 Pre-requisitos

1. **Node.js 18+** instalado
2. **Cuenta de Firebase** activa
3. **Git** configurado
4. **Cuenta de GitHub** (para clonar)

## 🔥 Configuración de Firebase

### 1. Crear Proyecto Firebase
```bash
1. Ir a https://console.firebase.google.com/
2. Hacer clic en "Crear proyecto"
3. Nombrar el proyecto (ej: "sala-reservas-hulux")
4. Habilitar Google Analytics (opcional)
5. Crear proyecto
```

### 2. Configurar Authentication
```bash
1. En la consola de Firebase, ir a "Authentication"
2. Hacer clic en "Comenzar"
3. Ir a la pestaña "Sign-in method"
4. Habilitar "Correo electrónico/contraseña"
5. Habilitar "Google" (opcional pero recomendado)
```

### 3. Configurar Firestore Database
```bash
1. En la consola de Firebase, ir a "Firestore Database"
2. Hacer clic en "Crear base de datos"
3. Comenzar en "Modo de prueba" (o configurar reglas personalizadas)
4. Seleccionar ubicación (preferiblemente cercana a usuarios)
```

### 4. Configurar Web App
```bash
1. En "Configuración del proyecto" > "General"
2. Hacer clic en "</>" (ícono web)
3. Registrar la app con un apodo (ej: "Sala Reservas Web")
4. Copiar las credenciales de configuración
```

## 💻 Instalación Local

### 1. Clonar y Configurar
```bash
# Clonar el repositorio
git clone https://github.com/ChemaMtz/Sala.git
cd Sala

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

### 2. Configurar Firebase
Editar `src/firebase/config.js` con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
}
```

### 3. Iniciar Desarrollo
```bash
npm run dev
```

## 🌐 Despliegue a Producción

### Opción 1: Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar Firebase en el proyecto
firebase login
firebase init

# Seleccionar:
# - Hosting
# - Usar proyecto existente
# - Directorio público: dist
# - Configurar como SPA: Yes
# - Sobrescribir index.html: No

# Construir y desplegar
npm run build
firebase deploy
```

### Opción 2: Netlify

```bash
# Construir el proyecto
npm run build

# En Netlify:
# 1. Conectar repositorio GitHub
# 2. Build command: npm run build
# 3. Publish directory: dist
# 4. Configurar variables de entorno en Netlify
```

### Opción 3: Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel dashboard
```

## 🔧 Variables de Entorno para Producción

Asegúrate de configurar estas variables en tu plataforma de hosting:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 👥 Configuración de Usuarios Administradores

Para crear usuarios administradores:

1. Registrar usuario normalmente en la aplicación
2. En Firebase Console > Firestore Database
3. Ir a la colección `usuarios`
4. Buscar el documento del usuario (por UID)
5. Editar y cambiar el campo `rol` de `"usuario"` a `"admin"`

## 🛠️ Mantenimiento

### Backup de Base de Datos
```bash
# Exportar Firestore
gcloud firestore export gs://your-bucket-name

# O usar Firebase CLI
firebase firestore:delete --all-collections
```

### Monitoreo
- Firebase Console > Analytics
- Firebase Console > Performance
- Firebase Console > Crashlytics (si se implementa)

## 🐛 Solución de Problemas Comunes

### Error: Firebase not initialized
- Verificar credenciales en `firebase/config.js`
- Asegurar que el proyecto Firebase esté activo

### Error: Permission denied
- Revisar reglas de Firestore
- Verificar autenticación del usuario

### Error de build en producción
- Verificar todas las variables de entorno
- Ejecutar `npm run build` localmente primero

---

¡Tu sistema de reservas Hulux está listo para producción! 🎉
