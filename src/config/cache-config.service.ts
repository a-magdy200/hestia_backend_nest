import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheType } from './enums/environment.enum';
import { CacheConfig } from './interfaces/cache.config.interface';

@Injectable()
export class CacheConfigSectionService {
  constructor(private readonly configService: ConfigService) {}

  get cache(): CacheConfig {
    const cacheConfig = this.configService.get<CacheConfig>('cache');
    if (!cacheConfig) {
      throw new Error('Cache configuration is not defined');
    }
    return cacheConfig;
  }

  get cacheType(): CacheType {
    return this.cache.type;
  }

  get cacheTtl(): number {
    return this.cache.ttl;
  }

  get cacheMaxItems(): number {
    return this.cache.maxItems;
  }
}
