# 📧 Sistema de Mensajería y Envío de Correos (ServicioCorreo)

Arquitectura desacoplada y escalable para el envío de correos electrónicos implementada con **Angular 22**, **Spring Boot 3 (Java 17)** y **Serverless Framework (AWS Lambda + Node.js)** integrado con la API de **SendGrid**.

---

## 🏗️ Arquitectura del Sistema

```
[ Angular 22 Frontend ]  (:4200)
         │  (HTTP POST /send-email)
         ▼
[ Spring Boot 3 Backend ] (:8080)
         │  (Evento Asíncrono @Async @EventListener)
         ▼
[ Serverless AWS Lambda ] (:3000 local / API Gateway en AWS)
         │  (SendGrid Mail SDK v8)
         ▼
[ SendGrid Mail Service ] ──▶ [ Bandeja del Destinatario ]
```

### Componentes:
1. **Frontend (`/frontend`)**: Aplicación Angular 22 moderna con formularios reactivos, validaciones en tiempo real, selector de endpoints (local vs AWS Cloud) y visor de historial.
2. **Backend (`/backend`)**: API REST construida con Spring Boot 3 que valida las peticiones (`to`, `subject`, `body`), desacopla la carga con eventos asíncronos y responde de inmediato con `202 Accepted`. Compatible con AWS Lambda mediante `aws-serverless-java-container-springboot3`.
3. **Serverless (`/serverless`)**: Función Lambda en Node.js 20 configurada mediante Serverless Framework para realizar el despacho hacia SendGrid. Incluye un emulador local HTTP para pruebas en desarrollo.

---

## 🚀 Despliegue Local

### Requisitos previos
- **Java 17+**
- **Node.js 18+** y **npm**
- Cuenta en SendGrid con API Key y remitente verificado

### 1. Servidor Serverless Local (Puerto 3000)
```bash
cd serverless
npm install
# Crear archivo .env basado en .env.example con tu SENDGRID_API_KEY y SENDGRID_FROM_EMAIL
npm start
```

### 2. Backend Spring Boot (Puerto 8080)
```bash
cd backend
# En Windows:
.\mvnw.cmd spring-boot:run
# En Linux/macOS:
./mvnw spring-boot:run
```

### 3. Frontend Angular (Puerto 4200)
```bash
cd frontend
npm install
npm start
```
Abre tu navegador en `http://localhost:4200`.

---

## ☁️ Despliegue en AWS (Serverless Framework)

### Desplegar función Lambda de Node.js:
```bash
cd serverless
npx serverless deploy --stage prod
```

### Desplegar Backend Spring Boot en AWS Lambda:
```bash
cd backend
mvn clean package -Pshaded-jar
npx serverless deploy --stage dev
```

---

## 🔒 Variables de Entorno

| Variable | Descripción | Ubicación |
| :--- | :--- | :--- |
| `SENDGRID_API_KEY` | Clave API de SendGrid para autenticación | `.env` en `/serverless` o `/backend` |
| `SENDGRID_FROM_EMAIL` | Correo remitente verificado en SendGrid | `.env` en `/serverless` o `/backend` |
| `SERVERLESS_EMAIL_URL` | Endpoint destino del servicio de correos | `application.yml` o `.env` |
