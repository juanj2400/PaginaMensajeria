package com.serviciocorreo.service;

import com.serviciocorreo.dto.EmailRequest;
import com.serviciocorreo.dto.EmailResponse;
import com.serviciocorreo.event.EmailEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Primary
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Value("${serverless.email-url:${SERVERLESS_EMAIL_URL:}}")
    private String serverlessEmailUrl;

    private final RestTemplate restTemplate;

    public EmailServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    public EmailServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate != null ? restTemplate : new RestTemplate();
    }

    // 1. Este método es llamado por el controlador.
    // Encola el mensaje y responde de inmediato al cliente.
    @Override
    public EmailResponse sendEmail(EmailRequest request) {
        EmailEvent event = new EmailEvent(request.getTo(), request.getSubject(), request.getMessage());
        eventPublisher.publishEvent(event);

        return new EmailResponse("Solicitud de correo encolada correctamente.");
    }

    // 2. Este método escucha el evento en segundo plano (gracias a @Async y @EventListener)
    // y se comunica con la función Serverless vía HTTP POST sin congelar la petición web.
    @Async
    @EventListener
    public void handleEmailEvent(EmailEvent event) {
        logger.info("[Cola / Evento] Procesando envío vía Serverless hacia: {}", event.getTo());

        if (serverlessEmailUrl == null || serverlessEmailUrl.trim().isEmpty()) {
            logger.warn("[Serverless] URL no configurada en 'serverless.email-url' o 'SERVERLESS_EMAIL_URL'.");
            return;
        }

        try {
            // Construir payload esperado por la función Lambda en Node.js (to, subject, message)
            Map<String, String> payload = new HashMap<>();
            payload.put("to", event.getTo());
            payload.put("subject", event.getSubject());
            payload.put("message", event.getMessage());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(payload, headers);

            logger.info("[Serverless] Enviando POST a: {}", serverlessEmailUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(serverlessEmailUrl, requestEntity, String.class);

            logger.info("[Serverless] Respuesta de Lambda - StatusCode: {}, Body: {}",
                    response.getStatusCode(), response.getBody());
        } catch (Exception ex) {
            logger.error("[Serverless Error] Falló el envío hacia la función Serverless: {}", ex.getMessage(), ex);
        }
    }
}