# Sistema de Reservas de Sala de Juntas

Una aplicación web simple y elegante para reservar salas de juntas en tu empresa, construida con React, Vite, Tailwind CSS y Firebase.

## Características

- ✅ Formulario de reserva intuitivo
- ✅ Validación de datos en tiempo real
- ✅ Gestión de material (HDMI, Proyector)
- ✅ Lista de reservas en tiempo real
- ✅ Interfaz responsiva y moderna
- ✅ Integración con Firebase Firestore

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Firestore Database
4. Obtén tu configuración de Firebase
5. Actualiza el archivo `src/firebase.js` con tu configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};
```

### 3. Configurar reglas de Firestore

En Firebase Console, ve a Firestore Database > Rules y configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservas/{document} {
      allow read, write: if true;
    }
  }
}
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

## Campos del Formulario

- **Nombre**: Nombre de quien solicita la reserva (requerido)
- **Fecha**: Fecha de la reserva (requerido)
- **Hora de entrada**: Hora de inicio (requerido)
- **Hora de salida**: Hora de finalización (requerido)
- **Material utilizado**: 
  - HDMI (opcional)
  - Proyector (opcional)

## Estructura del Proyecto

```
src/
  ├── App.jsx           # Componente principal con formulario
  ├── ReservasList.jsx  # Componente para listar reservas
  ├── firebase.js       # Configuración de Firebase
  ├── main.jsx         # Punto de entrada
  └── index.css        # Estilos globales con Tailwind
```

## Tecnologías Utilizadas

- **React 19** - Framework de frontend
- **Vite** - Herramienta de build
- **Tailwind CSS** - Framework de CSS
- **Firebase Firestore** - Base de datos NoSQL
- **ESLint** - Linter para JavaScript

## Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Edición y eliminación de reservas
- [ ] Validación de conflictos de horarios
- [ ] Notificaciones por email
- [ ] Vista de calendario
- [ ] Exportar reservas a PDF/Excel+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
