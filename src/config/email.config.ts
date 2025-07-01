import { EnvVar } from './enums';
import { EmailConfig } from './interfaces/external.config.interface';
import * as EnvUtil from './utils/env.util';

/**
 * Create SMTP configuration
 * @returns SMTP configuration object
 */
const createSmtpConfig = (): {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName?: string;
} => {
  const config: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromName?: string;
  } = {
    host: EnvUtil.getString(EnvVar.SMTP_HOST),
    port: EnvUtil.getNumber(EnvVar.SMTP_PORT, 587),
    secure: EnvUtil.getBoolean(EnvVar.SMTP_SECURE, false),
    username: EnvUtil.getString(EnvVar.SMTP_USERNAME),
    password: EnvUtil.getString(EnvVar.SMTP_PASSWORD),
  };

  if (EnvUtil.has(EnvVar.SMTP_FROM_NAME)) {
    config.fromName = EnvUtil.getString(EnvVar.SMTP_FROM_NAME);
  }

  return config;
};

/**
 * Create SendGrid configuration
 * @returns SendGrid configuration object
 */
const createSendGridConfig = (): {
  apiKey: string;
  fromName?: string;
} => {
  const config: {
    apiKey: string;
    fromName?: string;
  } = {
    apiKey: EnvUtil.getString(EnvVar.SENDGRID_API_KEY),
  };

  if (EnvUtil.has(EnvVar.SENDGRID_FROM_NAME)) {
    config.fromName = EnvUtil.getString(EnvVar.SENDGRID_FROM_NAME);
  }

  return config;
};

/**
 * Create Mailgun configuration
 * @returns Mailgun configuration object
 */
const createMailgunConfig = (): {
  apiKey: string;
  domain: string;
  fromName?: string;
} => {
  const config: {
    apiKey: string;
    domain: string;
    fromName?: string;
  } = {
    apiKey: EnvUtil.getString(EnvVar.MAILGUN_API_KEY),
    domain: EnvUtil.getString(EnvVar.MAILGUN_DOMAIN),
  };

  if (EnvUtil.has(EnvVar.MAILGUN_FROM_NAME)) {
    config.fromName = EnvUtil.getString(EnvVar.MAILGUN_FROM_NAME);
  }

  return config;
};

/**
 * Create email configuration
 * @returns Email configuration object
 */
export const createEmailConfig = (): EmailConfig => {
  const config: EmailConfig = {
    provider: (EnvUtil.getString(EnvVar.EMAIL_PROVIDER) as EmailConfig['provider']) || 'aws-ses',
    fromEmail: EnvUtil.getString(EnvVar.EMAIL_FROM),
    smtp: createSmtpConfig(),
    sendgrid: createSendGridConfig(),
    mailgun: createMailgunConfig(),
  };

  if (EnvUtil.has(EnvVar.EMAIL_REPLY_TO)) {
    config.replyToEmail = EnvUtil.getString(EnvVar.EMAIL_REPLY_TO);
  }

  return config;
};
