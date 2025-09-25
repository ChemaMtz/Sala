// Configuración de EmailJS
// IMPORTANTE: Debes configurar estos valores en tu cuenta de EmailJS

export const EMAIL_CONFIG = {
  // Obtén estos valores de tu cuenta en https://www.emailjs.com/
  SERVICE_ID: 'service_7fsdx0n',       // ID del servicio de EmailJS ✅ CONFIGURADO
  TEMPLATE_ID: 'template_55e8ww8',     // ID del template ✅ CONFIGURADO
  PUBLIC_KEY: 'svMBRlRebSaVlvFQj',     // Tu clave pública de EmailJS ✅ CONFIGURADO
  
  // Email de destino
  TO_EMAIL: '2023humanosdelux@gmail.com'
};

// Ejemplo de template para EmailJS:
/*
Título del template: Confirmación de Reserva - Hulux Espacios Corporativos

Contenido del template:
Estimado/a {{usuario_nombre}},

Su reserva ha sido confirmada exitosamente en nuestro sistema corporativo.

📋 CONFIRMACIÓN DE RESERVA:
• Responsable: {{usuario_nombre}}
• Evento/Reunión: {{reserva_nombre}}
• Categoría: {{reserva_categoria}}
• Fecha programada: {{reserva_fecha}}
• Horario: {{reserva_hora_inicio}} - {{reserva_hora_fin}}
• Duración total: {{reserva_duracion}}
• Recursos solicitados: {{reserva_materiales}}

Sistema de Reservas Hulux
*/