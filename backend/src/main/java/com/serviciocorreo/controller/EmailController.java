package com.serviciocorreo.controller;

import com.serviciocorreo.dto.EmailRequest;
import com.serviciocorreo.dto.EmailResponse;
import com.serviciocorreo.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "servicio-correo-backend",
                "runtime", "Spring Boot 3 / AWS Lambda"
        ));
    }

    @PostMapping("/send-email")
    public ResponseEntity<EmailResponse> sendEmail(@Valid @RequestBody EmailRequest request) {
        EmailResponse response = emailService.sendEmail(request);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
        }
    }
}
