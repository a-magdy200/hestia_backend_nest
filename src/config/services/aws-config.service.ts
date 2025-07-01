import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AwsConfig } from '../interfaces/external.config.interface';

/**
 * AWS configuration service
 * Provides centralized access to AWS configuration values
 */
@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get AWS configuration
   * @returns AWS configuration object
   */
  get aws(): AwsConfig {
    const awsConfig = this.configService.get<AwsConfig>('aws');
    if (!awsConfig) {
      throw new Error('AWS configuration is not defined');
    }
    return awsConfig;
  }

  /**
   * Get AWS region
   * @returns AWS region
   */
  get region(): string {
    return this.aws.region;
  }

  /**
   * Get AWS access key ID
   * @returns AWS access key ID
   */
  get accessKeyId(): string | undefined {
    return this.aws.accessKeyId;
  }

  /**
   * Get AWS secret access key
   * @returns AWS secret access key
   */
  get secretAccessKey(): string | undefined {
    return this.aws.secretAccessKey;
  }

  /**
   * Get AWS S3 configuration
   * @returns AWS S3 configuration
   */
  get s3(): AwsConfig['s3'] {
    return this.aws.s3;
  }

  /**
   * Get AWS SES configuration
   * @returns AWS SES configuration
   */
  get ses(): AwsConfig['ses'] {
    return this.aws.ses;
  }

  /**
   * Get AWS SNS configuration
   * @returns AWS SNS configuration
   */
  get sns(): AwsConfig['sns'] {
    return this.aws.sns;
  }

  /**
   * Get S3 bucket name
   * @returns S3 bucket name
   */
  get s3Bucket(): string {
    return this.s3?.bucket || '';
  }

  /**
   * Get S3 region
   * @returns S3 region
   */
  get s3Region(): string {
    return this.s3?.region || this.region;
  }

  /**
   * Check if S3 force path style is enabled
   * @returns True if S3 force path style is enabled
   */
  get s3ForcePathStyle(): boolean {
    return this.s3?.forcePathStyle || false;
  }

  /**
   * Get S3 signature version
   * @returns S3 signature version
   */
  get s3SignatureVersion(): string {
    return this.s3?.signatureVersion || 'v4';
  }

  /**
   * Get S3 max file size
   * @returns S3 max file size in bytes
   */
  get s3MaxFileSize(): number {
    return this.s3?.maxFileSize || 10485760;
  }

  /**
   * Get S3 allowed MIME types
   * @returns S3 allowed MIME types
   */
  get s3AllowedMimeTypes(): string[] {
    return this.s3?.allowedMimeTypes || [];
  }

  /**
   * Get S3 endpoint
   * @returns S3 endpoint
   */
  get s3Endpoint(): string | undefined {
    return this.s3?.endpoint;
  }

  /**
   * Get S3 public URL
   * @returns S3 public URL
   */
  get s3PublicUrl(): string | undefined {
    return this.s3?.publicUrl;
  }

  /**
   * Get SES region
   * @returns SES region
   */
  get sesRegion(): string {
    return this.ses?.region || this.region;
  }

  /**
   * Get SES from email
   * @returns SES from email
   */
  get sesFromEmail(): string {
    return this.ses?.fromEmail || '';
  }

  /**
   * Get SES max send rate
   * @returns SES max send rate
   */
  get sesMaxSendRate(): number {
    return this.ses?.maxSendRate || 14;
  }

  /**
   * Get SES reply to email
   * @returns SES reply to email
   */
  get sesReplyToEmail(): string | undefined {
    return this.ses?.replyToEmail;
  }

  /**
   * Get SES configuration set
   * @returns SES configuration set
   */
  get sesConfigurationSet(): string | undefined {
    return this.ses?.configurationSet;
  }

  /**
   * Get SNS region
   * @returns SNS region
   */
  get snsRegion(): string {
    return this.sns?.region || this.region;
  }

  /**
   * Get SNS topic ARN
   * @returns SNS topic ARN
   */
  get snsTopicArn(): string | undefined {
    return this.sns?.topicArn;
  }

  /**
   * Get SNS platform application ARN
   * @returns SNS platform application ARN
   */
  get snsPlatformApplicationArn(): string | undefined {
    return this.sns?.platformApplicationArn;
  }
}
