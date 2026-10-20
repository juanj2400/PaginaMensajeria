package com.serviciocorreo.service.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.serviciocorreo.dto.EmailRequest;
import com.serviciocorreo.dto.EmailResponse;
import com.serviciocorreo.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class SendGridEmailService implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(SendGridEmailService.class);

    @Value("${sendgrid.api-key:${SENDGRID_API_KEY:}}")
    private String apiKey;

    @Value("${sendgrid.from-email:${SENDGRID_FROM_EMAIL:no-reply@tudominio.com}}")
    private String fromEmail;

    @Override
    public EmailResponse sendEmail(EmailRequest request) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("SENDGRID_API_KEY no está configurada en las variables de entorno");
            throw new IllegalStateException("La variable de entorno SENDGRID_API_KEY no está configurada.");
        }

        Email from = new Email(fromEmail);
        String subject = request.getSubject();
        Email to = new Email(request.getTo());
        Content content = new Content("text/plain", request.getBody());
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request sendGridRequest = new Request();

        try {
            sendGridRequest.setMethod(Method.POST);
            sendGridRequest.setEndpoint("mail/send");
            sendGridRequest.setBody(mail.build());

            logger.info("Enviando correo vía SendGrid hacia: {}", request.getTo());
            Response response = sg.api(sendGridRequest);

            logger.info("SendGrid respondió con status code: {}", response.getStatusCode());

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return new EmailResponse(true, "Correo enviado exitosamente.", response.getStatusCode());
            } else {
                logger.error("SendGrid error: {}", response.getBody());
                return new EmailResponse(false, "SendGrid rechazó la solicitud (código " + response.getStatusCode() + "): " + response.getBody(), response.getStatusCode());
            }
        } catch (IOException ex) {
            logger.error("Error de conexión con SendGrid", ex);
            throw new RuntimeException("Fallo en la comunicación con SendGrid: " + ex.getMessage(), ex);
        }
    }
}
