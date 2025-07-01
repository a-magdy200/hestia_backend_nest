import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailConfig } from './interfaces/external.config.interface';

@Injectable()
export class EmailConfigSectionService {
  constructor(private readonly configService: ConfigService) {}

  get email(): EmailConfig {
    const emailConfig = this.configService.get<EmailConfig>('email');
    if (!emailConfig) {
      throw new Error('Email configuration is not defined');
    }
    return emailConfig;
  }

  get emailProvider(): EmailConfig['provider'] {
    return this.email.provider;
  }

  get fromEmail(): string {
    return this.email.fromEmail;
  }

  get replyToEmail(): string | undefined {
    return this.email.replyToEmail;
  }

  get smtpHost(): string {
    return this.email.smtp?.host ?? '';
  }

  get smtpPort(): number {
    return this.email.smtp?.port ?? 0;
  }

  get smtpSecure(): boolean {
    return this.email.smtp?.secure ?? false;
  }

  get sendgridApiKey(): string {
    return this.email.sendgrid?.apiKey ?? '';
  }

  get mailgunApiKey(): string {
    return this.email.mailgun?.apiKey ?? '';
  }

  get mailgunDomain(): string {
    return this.email.mailgun?.domain ?? '';
  }
}
