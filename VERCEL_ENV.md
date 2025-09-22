# Variables de Entorno para Vercel

Para que la aplicación funcione correctamente en Vercel, debes configurar estas variables de entorno en tu proyecto de Vercel:

## 🔧 Variables requeridas:

```
VITE_FIREBASE_API_KEY=AIzaSyDQ5WfHhVnHClDS1lMCDS1EuQahejoSEs4
VITE_FIREBASE_AUTH_DOMAIN=salar-3089a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=salar-3089a
VITE_FIREBASE_STORAGE_BUCKET=salar-3089a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=9306042415
VITE_FIREBASE_APP_ID=1:9306042415:web:bad149527f50016a2956da
```

## 📋 Cómo configurar en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a Settings > Environment Variables
3. Agrega cada variable una por una:
   - Name: VITE_FIREBASE_API_KEY
   - Value: AIzaSyDQ5WfHhVnHClDS1lMCDS1EuQahejoSEs4
   - Environment: Production (y Development si quieres)
4. Repite para todas las variables
5. Redeploy tu aplicación

## ⚠️ Importante:
- NO cambies los nombres de las variables (deben empezar con VITE_)
- Asegúrate de que todos los valores estén exactamente como se muestran
- Después de agregar las variables, haz un nuevo deployment