package com.serviciocorreo.service;

import com.serviciocorreo.dto.EmailRequest;
import com.serviciocorreo.dto.EmailResponse;

public interface EmailService {
    EmailResponse sendEmail(EmailRequest request);
}
