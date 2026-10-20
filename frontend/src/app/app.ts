import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from './services/email.service';
import { EmailRequest, EmailResponse } from './models/email.model';
import { environment } from '../environments/environment';

interface HistoryItem {
  to: string;
  subject: string;
  timestamp: Date;
  status: 'success' | 'error';
  statusCode: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailService = inject(EmailService);

  emailForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  lastResponse: EmailResponse | null = null;

  apiUrl: string = environment.apiUrl;
  showEndpointSettings = false;
  historyList: HistoryItem[] = [];

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.maxLength(200)]],
      body: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  get f() {
    return this.emailForm.controls;
  }

  toggleEndpointSettings(): void {
    this.showEndpointSettings = !this.showEndpointSettings;
  }

  setEndpoint(url: string): void {
    this.apiUrl = url;
    this.emailService.setApiUrl(url);
  }

  onSubmit(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const requestData: EmailRequest = this.emailForm.value;

    this.emailService.sendEmail(requestData, this.apiUrl).subscribe({
      next: (response: EmailResponse) => {
        this.isLoading = false;
        this.lastResponse = response;
        if (response.success) {
          this.successMessage = response.message || '¡Correo enviado con éxito!';
          this.addToHistory(requestData, 'success', response.statusCode || 202);
          this.emailForm.reset();
        } else {
          this.errorMessage = response.message || 'SendGrid reportó un problema al procesar el envío.';
          this.addToHistory(requestData, 'error', response.statusCode || 500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al enviar correo:', error);

        if (error.status === 0) {
          this.errorMessage = `No se pudo conectar con el servidor en ${this.apiUrl}. Verifique que el backend esté en ejecución y que CORS esté habilitado.`;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Error (${error.status}): ${error.statusText || 'Error inesperado al enviar el correo.'}`;
        }

        this.addToHistory(requestData, 'error', error.status || 0);
      }
    });
  }

  private addToHistory(req: EmailRequest, status: 'success' | 'error', statusCode: number): void {
    this.historyList.unshift({
      to: req.to,
      subject: req.subject,
      timestamp: new Date(),
      status,
      statusCode
    });

    if (this.historyList.length > 5) {
      this.historyList.pop();
    }
  }

  clearForm(): void {
    this.emailForm.reset();
    this.successMessage = null;
    this.errorMessage = null;
  }

  dismissAlert(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  fillSample(): void {
    this.emailForm.patchValue({
      to: 'destinatario@ejemplo.com',
      subject: 'Prueba de integración SendGrid + Spring Boot Serverless',
      body: '¡Hola! Este es un correo de prueba enviado desde la arquitectura Angular + Spring Boot 3 + AWS Lambda con SendGrid API.'
    });
  }
}
