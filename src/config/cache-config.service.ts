import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheType } from './enums/environment.enum';
import { CacheConfig } from './interfaces/cache.config.interface';

@Injectable()
export class CacheConfigSectionService {
  constructor(private configService: ConfigService) {}

  get cache(): CacheConfig {
    return this.configService.get<CacheConfig>('cache')!;
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
