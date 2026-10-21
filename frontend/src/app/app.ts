import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from './services/email.service';
import { EmailRequest, EmailResponse } from './models/email.model';
import { environment } from '../environments/environment';

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
    const trimmed = url ? url.trim() : '';
    if (trimmed) {
      this.apiUrl = trimmed;
      this.emailService.setApiUrl(trimmed);
    }
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
          this.successMessage = response.message || 'Correo enviado exitosamente.';
          this.emailForm.reset();
        } else {
          this.errorMessage = response.message || 'No se pudo enviar el correo.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al enviar correo:', error);

        if (error.status === 0) {
          this.errorMessage = `No se pudo conectar con el servidor (${this.apiUrl}). Verifica que esté en ejecución y con CORS habilitado.`;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Error (${error.status}): ${error.statusText || 'Error inesperado al enviar el correo.'}`;
        }
      }
    });
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
}
