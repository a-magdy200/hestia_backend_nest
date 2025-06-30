import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailConfig } from './interfaces/external.config.interface';

@Injectable()
export class EmailConfigSectionService {
  constructor(private configService: ConfigService) {}

  get email(): EmailConfig {
    return this.configService.get<EmailConfig>('email')!;
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
