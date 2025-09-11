// Configuración de EmailJS
// IMPORTANTE: Debes configurar estos valores en tu cuenta de EmailJS

export const EMAIL_CONFIG = {
  // Obtén estos valores de tu cuenta en https://www.emailjs.com/
  SERVICE_ID: 'service_idsozow',       // ID del servicio de EmailJS ✅ CONFIGURADO
  TEMPLATE_ID: 'template_bz44rrd',     // ID del template ✅ CONFIGURADO
  PUBLIC_KEY: 'WzvjZGt4WimWPWgha',     // Tu clave pública de EmailJS ✅ CONFIGURADO
  
  // Email de destino
  TO_EMAIL: 'chemjmme@gmail.com'
};

// Ejemplo de template para EmailJS:
/*
Título del template: Nueva Reserva de Sala - Hulux

Contenido del template:
Hola,

Se ha realizado una nueva reserva en el sistema:

📋 DETALLES DE LA RESERVA:
• Usuario: {{usuario_nombre}}
• Nombre/Evento: {{reserva_nombre}}
• Categoría: {{reserva_categoria}}
• Fecha: {{reserva_fecha}}
• Horario: {{reserva_hora_inicio}} - {{reserva_hora_fin}}
• Duración: {{reserva_duracion}}
• Materiales: {{reserva_materiales}}

⏰ RECORDATORIO:
El material y las llaves deben estar listos 5 minutos antes del inicio.

Sistema de Reservas Hulux
*/