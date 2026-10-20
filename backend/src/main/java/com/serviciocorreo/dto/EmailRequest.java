package com.serviciocorreo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EmailRequest {

    @NotBlank(message = "El destinatario (to) es obligatorio")
    @Email(message = "El formato del correo destinatario no es válido")
    private String to;

    @NotBlank(message = "El asunto (subject) es obligatorio")
    @Size(max = 200, message = "El asunto no puede superar los 200 caracteres")
    private String subject;

    @NotBlank(message = "El cuerpo del mensaje (body) es obligatorio")
    private String body;

    public EmailRequest() {
    }

    public EmailRequest(String to, String subject, String body) {
        this.to = to;
        this.subject = subject;
        this.body = body;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getMessage() {
        return body;
    }

    public void setMessage(String message) {
        this.body = message;
    }
}
