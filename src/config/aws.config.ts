import { EnvVar } from './enums';
import { AwsConfig } from './interfaces/external.config.interface';
import * as EnvUtil from './utils/env.util';

/**
 * Create AWS S3 configuration
 * @returns AWS S3 configuration object
 */
const createAwsS3Config = (): {
  bucket: string;
  region: string;
  signatureVersion?: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  endpoint?: string;
  publicUrl?: string;
} => {
  const config: {
    bucket: string;
    region: string;
    signatureVersion?: string;
    maxFileSize: number;
    allowedMimeTypes: string[];
    endpoint?: string;
    publicUrl?: string;
  } = {
    bucket: EnvUtil.getString(EnvVar.AWS_S3_BUCKET),
    region: EnvUtil.getWithFallback(EnvVar.AWS_S3_REGION, EnvVar.AWS_REGION, 'us-east-1'),
    signatureVersion: EnvUtil.getString(EnvVar.AWS_S3_SIGNATURE_VERSION, 'v4'),
    maxFileSize: EnvUtil.getNumber(EnvVar.AWS_S3_MAX_FILE_SIZE, 10485760), // 10MB
    allowedMimeTypes: EnvUtil.getString(
      EnvVar.AWS_S3_ALLOWED_MIME_TYPES,
      'image/jpeg,image/png,image/gif,application/pdf',
    ).split(','),
  };

  if (EnvUtil.has(EnvVar.AWS_S3_ENDPOINT)) {
    config.endpoint = EnvUtil.getString(EnvVar.AWS_S3_ENDPOINT);
  }
  if (EnvUtil.has(EnvVar.AWS_S3_PUBLIC_URL)) {
    config.publicUrl = EnvUtil.getString(EnvVar.AWS_S3_PUBLIC_URL);
  }

  return config;
};

/**
 * Create AWS SES configuration
 * @returns AWS SES configuration object
 */
const createAwsSesConfig = (): {
  region: string;
  fromEmail: string;
  replyToEmail?: string;
  configurationSet?: string;
} => {
  const config: {
    region: string;
    fromEmail: string;
    replyToEmail?: string;
    configurationSet?: string;
  } = {
    region: EnvUtil.getWithFallback(EnvVar.AWS_SES_REGION, EnvVar.AWS_REGION, 'us-east-1'),
    fromEmail: EnvUtil.getString(EnvVar.AWS_SES_FROM_EMAIL),
  };

  if (EnvUtil.has(EnvVar.AWS_SES_REPLY_TO_EMAIL)) {
    config.replyToEmail = EnvUtil.getString(EnvVar.AWS_SES_REPLY_TO_EMAIL);
  }
  if (EnvUtil.has(EnvVar.AWS_SES_CONFIGURATION_SET)) {
    config.configurationSet = EnvUtil.getString(EnvVar.AWS_SES_CONFIGURATION_SET);
  }

  return config;
};

/**
 * Create AWS SNS configuration
 * @returns AWS SNS configuration object
 */
const createAwsSnsConfig = (): {
  region: string;
  topicArn?: string;
  platformApplicationArn?: string;
} => {
  const config: {
    region: string;
    topicArn?: string;
    platformApplicationArn?: string;
  } = {
    region: EnvUtil.getWithFallback(EnvVar.AWS_SNS_REGION, EnvVar.AWS_REGION, 'us-east-1'),
  };

  if (EnvUtil.has(EnvVar.AWS_SNS_TOPIC_ARN)) {
    config.topicArn = EnvUtil.getString(EnvVar.AWS_SNS_TOPIC_ARN);
  }
  if (EnvUtil.has(EnvVar.AWS_SNS_PLATFORM_APPLICATION_ARN)) {
    config.platformApplicationArn = EnvUtil.getString(EnvVar.AWS_SNS_PLATFORM_APPLICATION_ARN);
  }

  return config;
};

/**
 * Create AWS configuration
 * @returns AWS configuration object
 */
export const createAwsConfig = (): AwsConfig => ({
  region: EnvUtil.getString(EnvVar.AWS_REGION, 'us-east-1'),
  accessKeyId: EnvUtil.getString(EnvVar.AWS_ACCESS_KEY_ID),
  secretAccessKey: EnvUtil.getString(EnvVar.AWS_SECRET_ACCESS_KEY),
  s3: createAwsS3Config(),
  ses: createAwsSesConfig(),
  sns: createAwsSnsConfig(),
});
