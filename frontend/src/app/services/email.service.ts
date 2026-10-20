import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailRequest, EmailResponse } from '../models/email.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly http = inject(HttpClient);
  private currentApiUrl: string = environment.apiUrl;

  getApiUrl(): string {
    return this.currentApiUrl;
  }

  setApiUrl(url: string): void {
    this.currentApiUrl = url.trim();
  }

  sendEmail(emailData: EmailRequest, customUrl?: string): Observable<EmailResponse> {
    const targetUrl = customUrl ? customUrl.trim() : this.currentApiUrl;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<EmailResponse>(targetUrl, emailData, { headers });
  }
}
