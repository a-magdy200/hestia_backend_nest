/**
 * AWS configuration interface
 * Defines the structure for AWS-related configuration
 */
export interface AwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  s3?: S3Config;
  ses?: SesConfig;
  sns?: SnsConfig;
}

/**
 * S3 configuration interface
 * Defines the structure for S3-specific configuration
 */
export interface S3Config {
  bucket: string;
  region: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  signatureVersion?: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  publicUrl?: string;
}

/**
 * SES configuration interface
 * Defines the structure for SES-specific configuration
 */
export interface SesConfig {
  region: string;
  fromEmail: string;
  replyToEmail?: string;
  maxSendRate?: number;
  configurationSet?: string;
}

/**
 * SNS configuration interface
 * Defines the structure for SNS-specific configuration
 */
export interface SnsConfig {
  region: string;
  topicArn?: string;
  platformApplicationArn?: string;
}

/**
 * Email configuration interface
 * Defines the structure for email-related configuration
 */
export interface EmailConfig {
  provider: 'aws-ses' | 'smtp' | 'sendgrid' | 'mailgun';
  fromEmail: string;
  replyToEmail?: string;
  smtp?: SmtpConfig;
  sendgrid?: SendgridConfig;
  mailgun?: MailgunConfig;
}

/**
 * SMTP configuration interface
 * Defines the structure for SMTP-specific configuration
 */
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName?: string;
}

/**
 * SendGrid configuration interface
 * Defines the structure for SendGrid-specific configuration
 */
export interface SendgridConfig {
  apiKey: string;
  fromName?: string;
}

/**
 * Mailgun configuration interface
 * Defines the structure for Mailgun-specific configuration
 */
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromName?: string;
}
