import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { EmailConfigService } from '../config/services/email-config.service';

/**
 * Email service for sending transactional emails
 * Supports multiple email providers with template-based emails
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailConfigService: EmailConfigService,
  ) {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on configuration
   */
  private initializeTransporter(): void {
    try {
      const config = this.emailConfigService.email;
      this.transporter = this.createTransporterForProvider(config);
      this.verifyTransporter();
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Create transporter for specific provider
   * @param config - Email configuration
   * @returns Transporter instance or null
   */
  private createTransporterForProvider(config: {
    provider: string;
    smtp?: unknown;
  }): nodemailer.Transporter | null {
    switch (config.provider) {
      case 'smtp':
        return this.createSmtpTransporter(
          config.smtp as {
            host?: string;
            port?: number;
            secure?: boolean;
            username?: string;
            password?: string;
          },
        );
      case 'sendgrid':
      case 'mailgun':
      case 'aws-ses':
        // For these providers, we'll use their API directly
        return null;
      default:
        this.logger.warn(`Unsupported email provider: ${config.provider}`);
        return null;
    }
  }

  /**
   * Create SMTP transporter
   * @param smtpConfig - SMTP configuration
   * @returns SMTP transporter
   */
  private createSmtpTransporter(smtpConfig: {
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
  }): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: smtpConfig?.host,
      port: smtpConfig?.port,
      secure: smtpConfig?.secure,
      auth: {
        user: smtpConfig?.username,
        pass: smtpConfig?.password,
      },
    });
  }

  /**
   * Verify transporter connection
   */
  private verifyTransporter(): void {
    if (this.transporter) {
      this.transporter.verify((error: Error | null) => {
        if (error) {
          this.logger.error('Email transporter verification failed:', error);
        } else {
          this.logger.log('Email transporter verified successfully');
        }
      });
    }
  }

  /**
   * Send email verification email
   * @param email - Recipient email
   * @param verificationToken - Email verification token
   * @param userName - User's name (optional)
   * @param requestId - Request identifier
   */
  async sendEmailVerification(
    email: string,
    verificationToken: string,
    userName?: string,
    requestId?: string,
  ): Promise<boolean> {
    try {
      const subject = 'Verify Your Email Address - Hestia Platform';
      const verificationUrl = `${this.getBaseUrl()}/auth/verify-email?token=${verificationToken}`;

      const htmlContent = this.generateEmailVerificationTemplate({
        userName: userName || 'User',
        verificationUrl,
        token: verificationToken,
      });

      const textContent = this.generateEmailVerificationTextTemplate({
        userName: userName || 'User',
        verificationUrl,
        token: verificationToken,
      });

      await this.sendEmail({
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
        ...(requestId && { requestId }),
      });

      this.logger.log('Email verification sent successfully', {
        requestId,
        email,
        userName,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send email verification', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Send password reset email
   * @param email - Recipient email
   * @param resetToken - Password reset token
   * @param userName - User's name (optional)
   * @param requestId - Request identifier
   */
  async sendPasswordReset(
    email: string,
    resetToken: string,
    userName?: string,
    requestId?: string,
  ): Promise<boolean> {
    try {
      const subject = 'Reset Your Password - Hestia Platform';
      const resetUrl = `${this.getBaseUrl()}/auth/reset-password?token=${resetToken}`;

      const htmlContent = this.generatePasswordResetTemplate({
        userName: userName || 'User',
        resetUrl,
        token: resetToken,
      });

      const textContent = this.generatePasswordResetTextTemplate({
        userName: userName || 'User',
        resetUrl,
        token: resetToken,
      });

      await this.sendEmail({
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
        ...(requestId && { requestId }),
      });

      this.logger.log('Password reset email sent successfully', {
        requestId,
        email,
        userName,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send password reset email', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Send welcome email
   * @param email - Recipient email
   * @param userName - User's name
   * @param requestId - Request identifier
   */
  async sendWelcomeEmail(email: string, userName: string, requestId?: string): Promise<boolean> {
    try {
      const subject = 'Welcome to Hestia Platform!';

      const htmlContent = this.generateWelcomeTemplate({
        userName,
        loginUrl: `${this.getBaseUrl()}/auth/login`,
      });

      const textContent = this.generateWelcomeTextTemplate({
        userName,
        loginUrl: `${this.getBaseUrl()}/auth/login`,
      });

      await this.sendEmail({
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
        ...(requestId && { requestId }),
      });

      this.logger.log('Welcome email sent successfully', {
        requestId,
        email,
        userName,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send welcome email', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Send account locked notification
   * @param email - Recipient email
   * @param userName - User's name
   * @param reason - Reason for account lock
   * @param requestId - Request identifier
   */
  async sendAccountLockedNotification(
    email: string,
    userName: string,
    reason: string,
    requestId?: string,
  ): Promise<boolean> {
    try {
      const subject = 'Account Locked - Hestia Platform';
      const supportUrl = `${this.getBaseUrl()}/support`;

      const htmlContent = this.generateAccountLockedTemplate({
        userName,
        reason,
        supportUrl,
      });

      const textContent = this.generateAccountLockedTextTemplate({
        userName,
        reason,
        supportUrl,
      });

      await this.sendEmail({
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
        ...(requestId && { requestId }),
      });

      this.logger.log('Account locked notification sent successfully', {
        requestId,
        email,
        userName,
        reason,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send account locked notification', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Send generic email
   * @param emailOptions - Email options
   */
  private async sendEmail(emailOptions: {
    to: string;
    subject: string;
    html: string;
    text: string;
    requestId?: string;
  }): Promise<void> {
    const config = this.emailConfigService.email;

    const mailOptions = {
      from: config.fromEmail,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    };

    switch (config.provider) {
      case 'smtp':
        if (this.transporter) {
          await this.transporter.sendMail(mailOptions);
        } else {
          throw new Error('SMTP transporter not initialized');
        }
        break;

      case 'sendgrid':
        await this.sendViaSendGrid(mailOptions, emailOptions.requestId);
        break;

      case 'mailgun':
        await this.sendViaMailgun(mailOptions, emailOptions.requestId);
        break;

      case 'aws-ses':
        await this.sendViaAwsSes(mailOptions, emailOptions.requestId);
        break;

      default:
        // For development, just log the email
        this.logger.log('Email would be sent (development mode):', {
          to: emailOptions.to,
          subject: emailOptions.subject,
          requestId: emailOptions.requestId,
        });
        break;
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(
    _mailOptions: Record<string, unknown>,
    requestId?: string,
  ): Promise<void> {
    // TODO: Implement SendGrid integration
    this.logger.log('SendGrid integration not implemented yet', { requestId });
    throw new Error('SendGrid integration not implemented');
  }

  /**
   * Send email via Mailgun
   */
  private async sendViaMailgun(
    _mailOptions: Record<string, unknown>,
    requestId?: string,
  ): Promise<void> {
    // TODO: Implement Mailgun integration
    this.logger.log('Mailgun integration not implemented yet', { requestId });
    throw new Error('Mailgun integration not implemented');
  }

  /**
   * Send email via AWS SES
   */
  private async sendViaAwsSes(
    _mailOptions: Record<string, unknown>,
    requestId?: string,
  ): Promise<void> {
    // TODO: Implement AWS SES integration
    this.logger.log('AWS SES integration not implemented yet', { requestId });
    throw new Error('AWS SES integration not implemented');
  }

  /**
   * Get base URL for email links
   */
  private getBaseUrl(): string {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const port = this.configService.get<number>('PORT', 3000);

    if (nodeEnv === 'production') {
      return this.configService.get<string>('APP_URL', 'https://hestia-platform.com');
    }

    return `http://localhost:${port}`;
  }

  // ============================================================================
  // EMAIL TEMPLATES
  // ============================================================================

  /**
   * Generate email verification HTML template
   */
  private generateEmailVerificationTemplate(data: {
    userName: string;
    verificationUrl: string;
    token: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Hestia Platform</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .token { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Hestia Platform!</h1>
            <p>Please verify your email address to complete your registration</p>
        </div>
        <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>Thank you for registering with Hestia Platform. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="token">${data.verificationUrl}</div>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create an account with Hestia Platform, please ignore this email.</p>
            
            <p>Best regards,<br>The Hestia Platform Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to you because you registered for a Hestia Platform account.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate email verification text template
   */
  private generateEmailVerificationTextTemplate(data: {
    userName: string;
    verificationUrl: string;
    token: string;
  }): string {
    return `
Welcome to Hestia Platform!

Hello ${data.userName},

Thank you for registering with Hestia Platform. To complete your registration and activate your account, please verify your email address by visiting the following link:

${data.verificationUrl}

If the link doesn't work, you can copy and paste it into your browser.

Important: This verification link will expire in 24 hours for security reasons.

If you didn't create an account with Hestia Platform, please ignore this email.

Best regards,
The Hestia Platform Team

---
This email was sent to you because you registered for a Hestia Platform account.
If you have any questions, please contact our support team.`;
  }

  /**
   * Generate password reset HTML template
   */
  private generatePasswordResetTemplate(data: {
    userName: string;
    resetUrl: string;
    token: string;
  }): string {
    const header = this.generatePasswordResetHeader();
    const content = this.generatePasswordResetContent(data);
    const footer = this.generatePasswordResetFooter();
    const styles = this.getPasswordResetStyles();

    return this.wrapInHtmlTemplate({
      title: 'Reset Your Password - Hestia Platform',
      styles,
      header,
      content,
      footer,
    });
  }

  /**
   * Generate password reset header
   */
  private generatePasswordResetHeader(): string {
    return `
        <div class="header">
            <h1>Password Reset Request</h1>
            <p>Reset your Hestia Platform password</p>
        </div>`;
  }

  /**
   * Generate password reset content
   */
  private generatePasswordResetContent(data: {
    userName: string;
    resetUrl: string;
    token: string;
  }): string {
    return `
        <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>We received a request to reset your password for your Hestia Platform account. To proceed with the password reset, please click the button below:</p>
            
            <div style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="token">${data.resetUrl}</div>
            
            <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                    <li>This password reset link will expire in 1 hour</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your password will not be changed unless you click the link above</li>
                </ul>
            </div>
            
            <p>If you have any questions or concerns, please contact our support team immediately.</p>
            
            <p>Best regards,<br>The Hestia Platform Team</p>
        </div>`;
  }

  /**
   * Generate password reset footer
   */
  private generatePasswordResetFooter(): string {
    return `
        <div class="footer">
            <p>This email was sent to you because a password reset was requested for your Hestia Platform account.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>`;
  }

  /**
   * Get password reset styles
   */
  private getPasswordResetStyles(): string {
    return `
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .token { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }`;
  }

  /**
   * Wrap content in HTML template
   */
  private wrapInHtmlTemplate(data: {
    title: string;
    styles: string;
    header: string;
    content: string;
    footer: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        ${data.styles}
    </style>
</head>
<body>
    <div class="container">
        ${data.header}
        ${data.content}
        ${data.footer}
    </div>
</body>
</html>`;
  }

  /**
   * Generate password reset text template
   */
  private generatePasswordResetTextTemplate(data: {
    userName: string;
    resetUrl: string;
    token: string;
  }): string {
    return `
Password Reset Request - Hestia Platform

Hello ${data.userName},

We received a request to reset your password for your Hestia Platform account. To proceed with the password reset, please visit the following link:

${data.resetUrl}

If the link doesn't work, you can copy and paste it into your browser.

SECURITY NOTICE:
- This password reset link will expire in 1 hour
- If you didn't request this password reset, please ignore this email
- Your password will not be changed unless you click the link above

If you have any questions or concerns, please contact our support team immediately.

Best regards,
The Hestia Platform Team

---
This email was sent to you because a password reset was requested for your Hestia Platform account.
If you have any questions, please contact our support team.`;
  }

  /**
   * Generate welcome HTML template
   */
  private generateWelcomeTemplate(data: { userName: string; loginUrl: string }): string {
    const header = this.generateWelcomeHeader();
    const content = this.generateWelcomeContent(data);
    const footer = this.generateWelcomeFooter();
    const styles = this.getWelcomeStyles();

    return this.wrapInHtmlTemplate({
      title: 'Welcome to Hestia Platform!',
      styles,
      header,
      content,
      footer,
    });
  }

  /**
   * Generate welcome header
   */
  private generateWelcomeHeader(): string {
    return `
        <div class="header">
            <h1>Welcome to Hestia Platform!</h1>
            <p>Your account has been successfully verified</p>
        </div>`;
  }

  /**
   * Generate welcome content
   */
  private generateWelcomeContent(data: { userName: string; loginUrl: string }): string {
    return `
        <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>Welcome to Hestia Platform! Your email has been successfully verified and your account is now active.</p>
            
            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="button">Get Started</a>
            </div>
            
            <div class="features">
                <h3>What you can do with Hestia Platform:</h3>
                <ul>
                    <li>Manage your recipes and ingredients</li>
                    <li>Create shopping lists</li>
                    <li>Track your nutrition goals</li>
                    <li>Connect with other food enthusiasts</li>
                    <li>Access personalized recommendations</li>
                </ul>
            </div>
            
            <p>We're excited to have you on board! If you have any questions or need assistance, our support team is here to help.</p>
            
            <p>Best regards,<br>The Hestia Platform Team</p>
        </div>`;
  }

  /**
   * Generate welcome footer
   */
  private generateWelcomeFooter(): string {
    return `
        <div class="footer">
            <p>Thank you for choosing Hestia Platform!</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>`;
  }

  /**
   * Get welcome styles
   */
  private getWelcomeStyles(): string {
    return `
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .features { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; }`;
  }

  /**
   * Generate welcome text template
   */
  private generateWelcomeTextTemplate(data: { userName: string; loginUrl: string }): string {
    return `
Welcome to Hestia Platform!

Hello ${data.userName},

Welcome to Hestia Platform! Your email has been successfully verified and your account is now active.

You can now log in to your account and start using all the features:

${data.loginUrl}

What you can do with Hestia Platform:
- Manage your recipes and ingredients
- Create shopping lists
- Track your nutrition goals
- Connect with other food enthusiasts
- Access personalized recommendations

We're excited to have you on board! If you have any questions or need assistance, our support team is here to help.

Best regards,
The Hestia Platform Team

---
Thank you for choosing Hestia Platform!
If you have any questions, please contact our support team.`;
  }

  /**
   * Generate account locked HTML template
   */
  private generateAccountLockedTemplate(data: {
    userName: string;
    reason: string;
    supportUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Locked - Hestia Platform</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fdf2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Locked</h1>
            <p>Your Hestia Platform account has been locked</p>
        </div>
        <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>We're writing to inform you that your Hestia Platform account has been locked for security reasons.</p>
            
            <div class="warning">
                <strong>Reason for account lock:</strong><br>
                ${data.reason}
            </div>
            
            <p>To unlock your account, please contact our support team. They will be happy to help you resolve this issue and get you back to using Hestia Platform.</p>
            
            <div style="text-align: center;">
                <a href="${data.supportUrl}" class="button">Contact Support</a>
            </div>
            
            <p>If you believe this lock was applied in error, please contact us immediately.</p>
            
            <p>Best regards,<br>The Hestia Platform Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to you because your Hestia Platform account has been locked.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate account locked text template
   */
  private generateAccountLockedTextTemplate(data: {
    userName: string;
    reason: string;
    supportUrl: string;
  }): string {
    return `
Account Locked - Hestia Platform

Hello ${data.userName},

We're writing to inform you that your Hestia Platform account has been locked for security reasons.

Reason for account lock:
${data.reason}

To unlock your account, please contact our support team. They will be happy to help you resolve this issue and get you back to using Hestia Platform.

Contact Support: ${data.supportUrl}

If you believe this lock was applied in error, please contact us immediately.

Best regards,
The Hestia Platform Team

---
This email was sent to you because your Hestia Platform account has been locked.
If you have any questions, please contact our support team.`;
  }
}
