export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp?: string;
}
