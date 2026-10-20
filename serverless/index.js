const sgMail = require('@sendgrid/mail');

// Configuración de la API Key de SendGrid desde variables de entorno
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'cayosi115@gmail.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('[ADVERTENCIA] SENDGRID_API_KEY no está configurada en las variables de entorno.');
}

/**
 * Helper para construir respuestas HTTP compatibles con API Gateway (CORS incluido)
 */
function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Handler principal de la función Lambda
 */
exports.handler = async (event) => {
  console.log('[Lambda] Evento recibido:', JSON.stringify(event));

  // Manejo de solicitudes preflight CORS (OPTIONS)
  const httpMethod = event.httpMethod || event.requestContext?.http?.method;
  if (httpMethod === 'OPTIONS') {
    return buildResponse(200, { message: 'OK' });
  }

  try {
    // 1. Validar que la API Key esté disponible
    if (!SENDGRID_API_KEY) {
      return buildResponse(500, {
        success: false,
        message: 'SENDGRID_API_KEY no está configurada en el servidor Lambda.',
      });
    }

    // 2. Parsear el cuerpo de la petición (JSON)
    let body = {};
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    const { to, subject, message } = body;

    // 3. Validar los campos obligatorios
    if (!to || !subject || !message) {
      return buildResponse(400, {
        success: false,
        message: 'Faltan campos obligatorios. Se requiere: to, subject, message.',
        received: { to: !!to, subject: !!subject, message: !!message },
      });
    }

    // 4. Preparar el correo para SendGrid
    const msg = {
      to,
      from: DEFAULT_FROM_EMAIL,
      subject,
      text: message,
      html: message.replace(/\n/g, '<br/>'),
    };

    console.log(`[SendGrid] Enviando correo desde ${DEFAULT_FROM_EMAIL} hacia ${to}...`);

    // 5. Enviar vía SendGrid
    const response = await sgMail.send(msg);

    const statusCode = response && response[0] ? response[0].statusCode : 202;
    console.log(`[SendGrid] Envío exitoso con status code: ${statusCode}`);

    return buildResponse(200, {
      success: true,
      message: 'Correo enviado exitosamente vía SendGrid Serverless.',
      statusCode,
      recipient: to,
    });
  } catch (error) {
    console.error('[Error] Falló el envío del correo:', error);

    // Errores detallados de la API de SendGrid si están disponibles
    const sendGridErrors = error.response?.body?.errors;
    const errorCode = error.code || error.statusCode || 500;

    return buildResponse(errorCode >= 400 && errorCode < 600 ? errorCode : 500, {
      success: false,
      message: error.message || 'Error interno al procesar el envío del correo.',
      details: sendGridErrors || null,
    });
  }
};
