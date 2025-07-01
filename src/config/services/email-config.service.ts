import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailConfig } from '../interfaces/external.config.interface';

/**
 * Email configuration service
 * Provides centralized access to email configuration values
 */
@Injectable()
export class EmailConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get email configuration
   * @returns Email configuration object
   */
  get email(): EmailConfig {
    const emailConfig = this.configService.get<EmailConfig>('email');
    if (!emailConfig) {
      throw new Error('Email configuration is not defined');
    }
    return emailConfig;
  }

  /**
   * Get email provider
   * @returns Email provider
   */
  get provider(): EmailConfig['provider'] {
    return this.email.provider;
  }

  /**
   * Get from email address
   * @returns From email address
   */
  get fromEmail(): string {
    return this.email.fromEmail;
  }

  /**
   * Get reply to email address
   * @returns Reply to email address
   */
  get replyToEmail(): string | undefined {
    return this.email.replyToEmail;
  }

  /**
   * Get SMTP configuration
   * @returns SMTP configuration
   */
  get smtp(): EmailConfig['smtp'] {
    return this.email.smtp;
  }

  /**
   * Get SendGrid configuration
   * @returns SendGrid configuration
   */
  get sendgrid(): EmailConfig['sendgrid'] {
    return this.email.sendgrid;
  }

  /**
   * Get Mailgun configuration
   * @returns Mailgun configuration
   */
  get mailgun(): EmailConfig['mailgun'] {
    return this.email.mailgun;
  }

  /**
   * Check if SMTP provider is used
   * @returns True if SMTP provider is used
   */
  get isSmtpProvider(): boolean {
    return this.provider === 'smtp';
  }

  /**
   * Check if SendGrid provider is used
   * @returns True if SendGrid provider is used
   */
  get isSendGridProvider(): boolean {
    return this.provider === 'sendgrid';
  }

  /**
   * Check if Mailgun provider is used
   * @returns True if Mailgun provider is used
   */
  get isMailgunProvider(): boolean {
    return this.provider === 'mailgun';
  }

  /**
   * Check if AWS SES provider is used
   * @returns True if AWS SES provider is used
   */
  get isAwsSesProvider(): boolean {
    return this.provider === 'aws-ses';
  }

  /**
   * Get SMTP host
   * @returns SMTP host
   */
  get smtpHost(): string {
    return this.smtp?.host || '';
  }

  /**
   * Get SMTP port
   * @returns SMTP port
   */
  get smtpPort(): number {
    return this.smtp?.port || 587;
  }

  /**
   * Check if SMTP is secure
   * @returns True if SMTP is secure
   */
  get smtpSecure(): boolean {
    return this.smtp?.secure || false;
  }

  /**
   * Get SMTP username
   * @returns SMTP username
   */
  get smtpUsername(): string {
    return this.smtp?.username || '';
  }

  /**
   * Get SMTP password
   * @returns SMTP password
   */
  get smtpPassword(): string {
    return this.smtp?.password || '';
  }

  /**
   * Get SMTP from name
   * @returns SMTP from name
   */
  get smtpFromName(): string | undefined {
    return this.smtp?.fromName;
  }

  /**
   * Get SendGrid API key
   * @returns SendGrid API key
   */
  get sendGridApiKey(): string {
    return this.sendgrid?.apiKey || '';
  }

  /**
   * Get SendGrid from name
   * @returns SendGrid from name
   */
  get sendGridFromName(): string | undefined {
    return this.sendgrid?.fromName;
  }

  /**
   * Get Mailgun API key
   * @returns Mailgun API key
   */
  get mailgunApiKey(): string {
    return this.mailgun?.apiKey || '';
  }

  /**
   * Get Mailgun domain
   * @returns Mailgun domain
   */
  get mailgunDomain(): string {
    return this.mailgun?.domain || '';
  }

  /**
   * Get Mailgun from name
   * @returns Mailgun from name
   */
  get mailgunFromName(): string | undefined {
    return this.mailgun?.fromName;
  }
}
