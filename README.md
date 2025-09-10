# Sistema de Reservas de Sala de Juntas

Una aplicación web simple y elegante para reservar salas d# 🏢 Sistema de Reservas Hulux

Un sistema moderno de reservas de salas desarrollado con React y Firebase, diseñado específicamente para **Hulux** con su identidad corporativa.

## ✨ Características Principales

### 🎨 **Interfaz Moderna**
- Diseño responsivo con colores corporativos Hulux (#2C3E50, #E67E22)
- Gradientes oceánicos y animaciones suaves
- Notificaciones profesionales con React Toastify
- Contraste optimizado para mejor accesibilidad

### 👥 **Sistema de Usuarios**
- **Autenticación dual**: Email/contraseña + Google Sign-In
- **Roles de usuario**: Usuario estándar y Administrador
- **Registro simplificado**: Solo datos esenciales

### 📅 **Gestión de Reservas**
- **Calendario interactivo** con React Calendar
- **Reservas en tiempo real** con Firebase Firestore
- **Validación de conflictos** de horarios
- **Gestión de materiales** por reserva

### 🛡️ **Panel de Administración**
- **Vista completa** de todas las reservas
- **Estadísticas en tiempo real**
- **Filtros avanzados** por fecha y usuario
- **Gestión completa** de reservas

### 📱 **Experiencia de Usuario**
- **Mis Reservas**: Vista personal de reservas
- **Estados claros**: Próximas/pasadas con indicadores visuales
- **Instrucciones post-reserva**: "Pasar con administración por las llaves y el material 5 minutos antes"
- **Navegación intuitiva** con iconos React Icons

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 19.1.1 + Vite 7.1.2
- **Estilos**: Bootstrap 5.3.3 + CSS personalizado
- **Backend**: Firebase 12.2.1 (Auth + Firestore)
- **Notificaciones**: React Toastify 11.0.5
- **Iconos**: React Icons 5.5.0
- **Calendario**: React Calendar 6.0.0

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ChemaMtz/Sala.git
   cd Sala
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password + Google)
   - Crear base de datos Firestore
   - Actualizar `src/firebase/config.js` con tus credenciales

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🏗️ Estructura del Proyecto

```
sala-j/
├── public/
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx      # Panel administrativo
│   │   ├── Login.jsx          # Formulario de login
│   │   ├── Register.jsx       # Formulario de registro
│   │   ├── MisReservas.jsx    # Vista personal de reservas
│   │   ├── Header.css         # Estilos de navegación
│   │   └── Auth.css          # Estilos de autenticación
│   ├── firebase/
│   │   └── config.js         # Configuración Firebase
│   ├── App.jsx              # Componente principal
│   ├── App.css             # Estilos globales
│   └── main.jsx           # Punto de entrada
├── package.json
└── README.md
```

## 🎨 Guía de Colores Hulux

- **Azul Marino**: `#2C3E50` - Color principal corporativo
- **Naranja**: `#E67E22` - Color de acento y botones
- **Blanco**: `#FFFFFF` - Backgrounds y texto
- **Gradiente Oceánico**: `#0f4c75 → #3282b8 → #bbe1fa`

## 👤 Roles de Usuario

### **Usuario Estándar**
- Crear reservas personales
- Ver calendario de disponibilidad
- Gestionar sus propias reservas
- Recibir instrucciones post-reserva

### **Administrador**
- Acceso al panel de administración
- Ver todas las reservas del sistema
- Cancelar cualquier reserva
- Estadísticas y filtros avanzados

## 🔧 Funcionalidades Técnicas

### **Tiempo Real**
- Sincronización automática con Firebase
- Actualizaciones instantáneas del calendario
- Notificaciones en tiempo real

### **Validaciones**
- Conflictos de horarios automáticos
- Formularios con validación en vivo
- Estados de error claros

### **Accesibilidad**
- Contraste optimizado para WCAG
- Iconos descriptivos
- Navegación por teclado

## 📄 Licencia

Este proyecto fue desarrollado específicamente para Hulux.

---

**Desarrollado con ❤️ para Hulux** 🏢as en tu empresa, construida con React, Vite, Tailwind CSS y Firebase.

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
