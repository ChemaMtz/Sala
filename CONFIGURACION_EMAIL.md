# Configuración de EmailJS para Envío de Correos

## 📧 Configuración del Sistema de Correos

El sistema está configurado para enviar correos automáticos a `chemjmme@gmail.com` cada vez que se hace una reserva.

## 🔧 Pasos para Configurar EmailJS

### 1. Crear Cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Regístrate con tu email
3. Verifica tu cuenta

### 2. Configurar Servicio de Email
1. En el dashboard, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona **Gmail** (o tu proveedor preferido)
4. Conecta tu cuenta de Gmail
5. Copia el **Service ID** (ej: `service_1a2b3c4`)

### 3. Crear Template de Email
1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Configura el template con estos parámetros:

**Template Name:** `Reserva de Sala - Hulux`

**To Email:** `{{to_email}}`

**From Name:** `{{from_name}}`

**Subject:** `Nueva Reserva de Sala - {{reserva_nombre}}`

**Content:**
```
Hola,

Se ha realizado una nueva reserva en el sistema:

📋 DETALLES DE LA RESERVA:
• Usuario: {{usuario_nombre}}
• Nombre: {{reserva_nombre}}
• Categoría: {{reserva_categoria}}
• Fecha: {{reserva_fecha}}
• Horario: {{reserva_hora_inicio}} - {{reserva_hora_fin}}
• Duración: {{reserva_duracion}}
• Materiales: {{reserva_materiales}}

Sistema de Reservas Hulux
```

4. Guarda el template y copia el **Template ID** (ej: `template_xyz123`)

### 4. Obtener Clave Pública
1. Ve a **"Account"** → **"General"**
2. Copia tu **Public Key** (ej: `user_abcd1234efgh5678`)

### 5. Configurar en la Aplicación
Edita el archivo `src/config/emailConfig.js`:

```javascript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_1a2b3c4',      // Tu Service ID de EmailJS
  TEMPLATE_ID: 'template_xyz123',     // Tu Template ID de EmailJS
  PUBLIC_KEY: 'user_abcd1234efgh5678', // Tu Public Key de EmailJS
  TO_EMAIL: 'chemjmme@gmail.com'      // Email de destino
};
```

## 📨 Información del Correo

Cada reserva enviará un correo con:
- ✅ Nombre del usuario que hizo la reserva
- ✅ Nombre/evento de la reserva
- ✅ Categoría seleccionada
- ✅ Fecha completa (día, mes, año)
- ✅ Horario de inicio y fin
- ✅ Duración calculada
- ✅ Lista de materiales solicitados
- ✅ Recordatorio para preparar llaves y material

## 🔒 Límites de EmailJS

**Plan Gratuito:**
- 200 emails por mes
- 2 servicios de email
- Templates ilimitados

**Si necesitas más emails:**
- Plan Personal: $15/mes (50,000 emails)
- Plan Pro: $35/mes (150,000 emails)

## 🚨 Solución de Problemas

### Error: "Service not found"
- Verifica que el `SERVICE_ID` sea correcto
- Asegúrate de que el servicio esté activo

### Error: "Template not found"
- Verifica que el `TEMPLATE_ID` sea correcto
- Asegúrate de que el template esté publicado

### Error: "Public key invalid"
- Verifica que el `PUBLIC_KEY` sea correcto
- Asegúrate de no tener espacios extra

### Correos no llegan
- Revisa la carpeta de spam
- Verifica que la dirección de destino sea correcta
- Revisa los logs en la consola del navegador

## ✅ Verificación

Una vez configurado, cada reserva:
1. Se guarda en Firebase
2. Se muestra la notificación de éxito
3. Se envía automáticamente un correo a `chemjmme@gmail.com`

Si hay problemas con el correo, la reserva se guarda de todas formas.