import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthStrategy } from './enums/environment.enum';
import { AuthConfig } from './interfaces/auth.config.interface';

@Injectable()
export class AuthConfigSectionService {
  constructor(private readonly configService: ConfigService) {}

  get auth(): AuthConfig {
    const authConfig = this.configService.get<AuthConfig>('auth');
    if (!authConfig) {
      throw new Error('Auth configuration is not defined');
    }
    return authConfig;
  }

  get authStrategy(): AuthStrategy {
    return this.auth.strategy;
  }

  get jwtSecret(): string {
    return this.auth.jwtSecret;
  }

  get jwtExpiresIn(): string {
    return this.auth.jwtExpiresIn;
  }

  get jwtRefreshExpiresIn(): string {
    return this.auth.jwtRefreshExpiresIn;
  }

  get saltRounds(): number {
    return this.auth.saltRounds;
  }
}
