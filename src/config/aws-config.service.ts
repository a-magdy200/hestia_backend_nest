import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AwsConfig } from './interfaces/external.config.interface';

@Injectable()
export class AwsConfigSectionService {
  constructor(private readonly configService: ConfigService) {}

  get aws(): AwsConfig {
    const awsConfig = this.configService.get<AwsConfig>('aws');
    if (!awsConfig) {
      throw new Error('AWS configuration is not defined');
    }
    return awsConfig;
  }

  get awsRegion(): string {
    return this.aws.region;
  }

  get awsAccessKeyId(): string {
    return this.aws.accessKeyId;
  }

  get awsSecretAccessKey(): string {
    return this.aws.secretAccessKey;
  }

  get s3Bucket(): string {
    return this.aws.s3?.bucket ?? '';
  }

  get s3Region(): string {
    return this.aws.s3?.region ?? '';
  }
}
