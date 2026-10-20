package com.serviciocorreo.dto;

import java.time.LocalDateTime;

public class EmailResponse {

    private boolean success;
    private String message;
    private int statusCode;
    private LocalDateTime timestamp;

    public EmailResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public EmailResponse(String message) {
        this.success = true;
        this.message = message;
        this.statusCode = 202;
        this.timestamp = LocalDateTime.now();
    }

    public EmailResponse(boolean success, String message, int statusCode) {
        this.success = success;
        this.message = message;
        this.statusCode = statusCode;
        this.timestamp = LocalDateTime.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
