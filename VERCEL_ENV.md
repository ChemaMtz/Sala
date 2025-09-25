# Variables de Entorno para Vercel

Para que la aplicación funcione correctamente en Vercel, debes configurar estas variables de entorno en tu proyecto de Vercel:

## 🔧 Variables requeridas:

```
VITE_FIREBASE_API_KEY=AIzaSyCSVXaEttnWkVilULncGMXoLodKEWsUU2o
VITE_FIREBASE_AUTH_DOMAIN=basedatos-m.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=basedatos-m
VITE_FIREBASE_STORAGE_BUCKET=basedatos-m.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=560580028581
VITE_FIREBASE_APP_ID=1:560580028581:web:9b5e5b15ad1adbebe2054c
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