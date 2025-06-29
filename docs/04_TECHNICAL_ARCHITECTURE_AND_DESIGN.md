# Hestia Enterprise SaaS Platform - Technical Architecture & Design

## 📋 Document Information

| **Document Type** | Technical Architecture & Design |
|-------------------|---------------------------------|
| **Version** | 1.0.0 |
| **Last Updated** | December 28, 2024 |
| **Next Review** | January 28, 2025 |
| **Document Owner** | Technical Architecture Team |
| **Stakeholders** | Development Team, DevOps Team, Security Team, Product Team |
| **Classification** | Technical Design Document |

---

## 🎯 Executive Summary

This document defines the comprehensive technical architecture and design for the Hestia Enterprise SaaS Platform. It follows clean architecture principles, domain-driven design, and enterprise-grade patterns to ensure scalability, security, and maintainability.

### **Architecture Principles**
1. **Clean Architecture**: Separation of concerns with clear layer boundaries
2. **Domain-Driven Design**: Business logic centered around domain models
3. **Microservices Ready**: Modular design supporting future microservices migration
4. **Security First**: Comprehensive security at every layer
5. **Scalability**: Horizontal and vertical scaling capabilities
6. **Observability**: Comprehensive monitoring and logging
7. **Resilience**: Fault tolerance and disaster recovery

---

## 🏗️ System Architecture Overview

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                 🌐 Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   REST API      │  │   GraphQL API   │  │  WebSocket  │ │
│  │   (NestJS)      │  │   (Planned)     │  │  Real-time  │ │
│  │                 │  │                 │  │             │ │
│  │ • Authentication│  │ • Query Opt.    │  │ • Live Updates│ │
│  │ • Rate Limiting │  │ • Subscription  │  │ • Chat       │ │
│  │ • Validation    │  │ • Real-time     │  │ • Notifications│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│                🔧 Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │    Auth App     │  │   Recipe App    │  │Business App │ │
│  │                 │  │                 │  │             │ │
│  │ • JWT Management│  │ • CRUD Ops      │ • Analytics    │ │
│  │ • SSO Integration│  │ • Search Engine │ • Reporting    │ │
│  │ • RBAC System   │  │ • AI Recs       │ • Billing      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│                 💼 Domain Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │    Entities     │  │  Domain Services│  │    Ports    │ │
│  │                 │  │                 │  │             │ │
│  │ • Recipe Model  │  │ • Business Logic│ • Repository   │ │
│  │ • User Model    │  │ • Validation    │   Interfaces   │ │
│  │ • Business Rules│  │ • Workflows     │ • Service      │ │
│  └─────────────────┘  └─────────────────┘   Contracts   │ │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│               🔧 Infrastructure Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ PostgreSQL      │  │     Storage     │  │   External  │ │
│  │                 │  │                 │  │   Services  │ │
│  │ • TypeORM       │  │ • Local/S3/Wasabi│ • Payment APIs │ │
│  │ • Migrations    │  │ • CDN           │ • Email Service│ │
│  │ • Connection Pool│  │ • File Proc.    │ • AI/ML APIs   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Backend Technologies**

| **Component** | **Technology** | **Version** | **Purpose** |
|---------------|----------------|-------------|-------------|
| **Runtime** | Node.js | 18.x LTS | JavaScript runtime environment |
| **Language** | TypeScript | 5.x | Type-safe JavaScript development |
| **Framework** | NestJS | 10.x | Modular server-side application framework |
| **Database** | PostgreSQL | 15.x | Primary relational database |
| **ORM** | TypeORM | 0.3.x | Database abstraction and migrations |
| **Cache** | Redis | 7.x | High-performance caching and sessions |
| **Message Queue** | RabbitMQ | 3.12.x | Asynchronous message processing |
| **Search** | Custom Search Engine | - | Full-text search and analytics |

### **Custom Search Engine Implementation**

#### **Architecture Decision**
The platform implements a custom search engine instead of using Elasticsearch to:
- **Reduce Infrastructure Complexity**: Eliminate dependency on external search service
- **Cost Optimization**: Avoid Elasticsearch licensing and infrastructure costs
- **Performance Control**: Optimize search algorithms for specific use cases
- **Data Sovereignty**: Keep search data within the application ecosystem
- **Customization**: Implement domain-specific search features for recipes and ingredients

#### **Search Engine Components**

##### **1. Full-Text Search Service**
```typescript
@Injectable()
export class SearchService {
  constructor(
    private readonly recipeRepository: Repository<Recipe>,
    private readonly ingredientRepository: Repository<Ingredient>,
    private readonly cacheService: CacheService,
  ) {}

  async searchRecipes(query: SearchQuery): Promise<SearchResult<Recipe>> {
    const cacheKey = `search:recipes:${this.hashQuery(query)}`;
    
    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Build search query
    const qb = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredient')
      .leftJoinAndSelect('recipe.categories', 'category')
      .leftJoinAndSelect('recipe.tags', 'tag');

    // Apply search filters
    if (query.text) {
      qb.andWhere(
        '(recipe.title ILIKE :text OR recipe.description ILIKE :text OR ' +
        'ingredient.name ILIKE :text OR category.name ILIKE :text OR ' +
        'tag.name ILIKE :text)',
        { text: `%${query.text}%` }
      );
    }

    // Apply filters
    if (query.categories?.length) {
      qb.andWhere('category.id IN (:...categories)', { categories: query.categories });
    }

    if (query.difficulty) {
      qb.andWhere('recipe.difficulty = :difficulty', { difficulty: query.difficulty });
    }

    if (query.cookingTime) {
      qb.andWhere('recipe.cookingTime <= :cookingTime', { cookingTime: query.cookingTime });
    }

    // Apply sorting
    switch (query.sortBy) {
      case 'relevance':
        // Custom relevance scoring
        qb.addSelect('CASE WHEN recipe.title ILIKE :exactText THEN 3 ' +
                    'WHEN recipe.description ILIKE :exactText THEN 2 ' +
                    'ELSE 1 END', 'relevance_score')
          .setParameter('exactText', query.text)
          .orderBy('relevance_score', 'DESC');
        break;
      case 'rating':
        qb.orderBy('recipe.averageRating', 'DESC');
        break;
      case 'newest':
        qb.orderBy('recipe.createdAt', 'DESC');
        break;
      default:
        qb.orderBy('recipe.title', 'ASC');
    }

    // Apply pagination
    qb.skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [recipes, total] = await qb.getManyAndCount();

    const result = {
      items: recipes,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };

    // Cache results for 5 minutes
    await this.cacheService.set(cacheKey, JSON.stringify(result), 300);
    
    return result;
  }

  async searchIngredients(query: SearchQuery): Promise<SearchResult<Ingredient>> {
    const cacheKey = `search:ingredients:${this.hashQuery(query)}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const qb = this.ingredientRepository.createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.categories', 'category');

    if (query.text) {
      qb.andWhere(
        '(ingredient.name ILIKE :text OR ingredient.description ILIKE :text OR ' +
        'category.name ILIKE :text)',
        { text: `%${query.text}%` }
      );
    }

    if (query.categories?.length) {
      qb.andWhere('category.id IN (:...categories)', { categories: query.categories });
    }

    if (query.allergens?.length) {
      qb.andWhere('ingredient.allergens && :allergens', { allergens: query.allergens });
    }

    // Apply sorting
    switch (query.sortBy) {
      case 'name':
        qb.orderBy('ingredient.name', 'ASC');
        break;
      case 'popularity':
        qb.orderBy('ingredient.usageCount', 'DESC');
        break;
      default:
        qb.orderBy('ingredient.name', 'ASC');
    }

    qb.skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [ingredients, total] = await qb.getManyAndCount();

    const result = {
      items: ingredients,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };

    await this.cacheService.set(cacheKey, JSON.stringify(result), 300);
    
    return result;
  }

  private hashQuery(query: SearchQuery): string {
    return crypto.createHash('md5').update(JSON.stringify(query)).digest('hex');
  }
}
```

##### **2. Search Index Management**
```typescript
@Injectable()
export class SearchIndexService {
  constructor(
    private readonly recipeRepository: Repository<Recipe>,
    private readonly ingredientRepository: Repository<Ingredient>,
    private readonly cacheService: CacheService,
  ) {}

  async rebuildRecipeIndex(): Promise<void> {
    // Clear existing cache
    await this.cacheService.del('search:recipes:*');

    // Update recipe search metadata
    await this.recipeRepository
      .createQueryBuilder()
      .update(Recipe)
      .set({
        searchVector: () => `
          setweight(to_tsvector('english', title), 'A') ||
          setweight(to_tsvector('english', description), 'B') ||
          setweight(to_tsvector('english', instructions), 'C')
        `,
        updatedAt: new Date(),
      })
      .execute();
  }

  async rebuildIngredientIndex(): Promise<void> {
    await this.cacheService.del('search:ingredients:*');

    await this.ingredientRepository
      .createQueryBuilder()
      .update(Ingredient)
      .set({
        searchVector: () => `
          setweight(to_tsvector('english', name), 'A') ||
          setweight(to_tsvector('english', description), 'B')
        `,
        updatedAt: new Date(),
      })
      .execute();
  }
}
```

##### **3. Advanced Search Features**
```typescript
@Injectable()
export class AdvancedSearchService {
  async searchByNutritionalCriteria(criteria: NutritionalCriteria): Promise<Recipe[]> {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredient')
      .leftJoinAndSelect('ingredient.nutritionalInfo', 'nutrition')
      .where('nutrition.calories <= :maxCalories', { maxCalories: criteria.maxCalories })
      .andWhere('nutrition.protein >= :minProtein', { minProtein: criteria.minProtein })
      .andWhere('nutrition.fiber >= :minFiber', { minFiber: criteria.minFiber })
      .getMany();
  }

  async searchByDietaryRestrictions(restrictions: string[]): Promise<Recipe[]> {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredient')
      .where('ingredient.allergens IS NULL OR NOT (ingredient.allergens && :restrictions)')
      .setParameter('restrictions', restrictions)
      .getMany();
  }

  async searchBySeasonalIngredients(season: string, region: string): Promise<Recipe[]> {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredient')
      .leftJoinAndSelect('ingredient.seasonalInfo', 'seasonal')
      .where('seasonal.season = :season', { season })
      .andWhere('seasonal.region = :region', { region })
      .getMany();
  }
}
```

#### **Performance Optimizations**

##### **1. Database Indexing**
```sql
-- Full-text search indexes
CREATE INDEX idx_recipes_search_vector ON recipes USING GIN(search_vector);
CREATE INDEX idx_ingredients_search_vector ON ingredients USING GIN(search_vector);

-- Composite indexes for common queries
CREATE INDEX idx_recipes_category_difficulty ON recipes(category_id, difficulty);
CREATE INDEX idx_recipes_cooking_time ON recipes(cooking_time);
CREATE INDEX idx_ingredients_category ON ingredients(category_id);

-- Partial indexes for active content
CREATE INDEX idx_recipes_active ON recipes(id) WHERE is_active = true;
CREATE INDEX idx_ingredients_active ON ingredients(id) WHERE is_active = true;
```

##### **2. Caching Strategy**
```typescript
@Injectable()
export class SearchCacheService {
  constructor(private readonly cacheService: CacheService) {}

  async getCachedSearch(query: SearchQuery): Promise<SearchResult | null> {
    const cacheKey = this.generateCacheKey(query);
    return this.cacheService.get(cacheKey);
  }

  async cacheSearchResult(query: SearchQuery, result: SearchResult): Promise<void> {
    const cacheKey = this.generateCacheKey(query);
    const ttl = this.calculateTTL(query);
    await this.cacheService.set(cacheKey, result, ttl);
  }

  async invalidateSearchCache(pattern: string): Promise<void> {
    await this.cacheService.del(pattern);
  }

  private generateCacheKey(query: SearchQuery): string {
    return `search:${query.type}:${crypto.createHash('md5').update(JSON.stringify(query)).digest('hex')}`;
  }

  private calculateTTL(query: SearchQuery): number {
    // Longer TTL for popular searches, shorter for specific queries
    return query.text?.length > 10 ? 300 : 600; // 5-10 minutes
  }
}
```

#### **Search Analytics**
```typescript
@Injectable()
export class SearchAnalyticsService {
  async trackSearchQuery(query: SearchQuery, results: SearchResult): Promise<void> {
    await this.searchEventRepository.save({
      query: query.text,
      filters: query.filters,
      resultCount: results.total,
      executionTime: results.executionTime,
      userId: query.userId,
      timestamp: new Date(),
    });
  }

  async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
    return this.searchEventRepository
      .createQueryBuilder('event')
      .select('event.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(event.resultCount)', 'avgResults')
      .groupBy('event.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
```

### **Storage Technologies**

| **Component** | **Technology** | **Version** | **Purpose** |
|---------------|----------------|-------------|-------------|
| **Local Storage** | Node.js fs | Built-in | Development and testing |
| **Cloud Storage** | AWS S3 | Latest | Production file storage |
| **Alternative Cloud** | Wasabi | Latest | Cost-effective S3-compatible storage |
| **CDN** | CloudFlare | Latest | Global content delivery |
| **File Processing** | Sharp | 0.32.x | Image optimization and processing |

### **Frontend Technologies**

| **Component** | **Technology** | **Version** | **Purpose** |
|---------------|----------------|-------------|-------------|
| **Framework** | React | 18.x | User interface library |
| **Language** | TypeScript | 5.x | Type-safe development |
| **State Management** | Redux Toolkit | 1.9.x | Application state management |
| **UI Library** | Material-UI | 5.x | Component library |
| **Mobile** | React Native | 0.72.x | Cross-platform mobile development |
| **PWA** | Workbox | 7.x | Progressive web app capabilities |

### **DevOps & Infrastructure**

| **Component** | **Technology** | **Version** | **Purpose** |
|---------------|----------------|-------------|-------------|
| **Containerization** | Docker | 24.x | Application containerization |
| **Orchestration** | Kubernetes | 1.28.x | Container orchestration |
| **CI/CD** | GitHub Actions | Latest | Automated deployment |
| **Monitoring** | Prometheus | 2.47.x | Metrics collection |
| **Visualization** | Grafana | 10.x | Metrics visualization |
| **Logging** | ELK Stack | 8.x | Centralized logging |
| **CDN** | CloudFlare | Latest | Content delivery network |

### **Security & Compliance**

| **Component** | **Technology** | **Version** | **Purpose** |
|---------------|----------------|-------------|-------------|
| **Authentication** | JWT | Latest | Stateless authentication |
| **Encryption** | bcrypt | 5.x | Password hashing |
| **SSL/TLS** | Let's Encrypt | Latest | Transport layer security |
| **WAF** | CloudFlare WAF | Latest | Web application firewall |
| **Vulnerability Scanner** | Snyk | Latest | Security vulnerability scanning |

---

## 📁 Storage Architecture

### **Multi-Environment Storage Strategy**

#### **Development Environment**
```typescript
// Local file storage for development
@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, path);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, file.buffer);
    return `file://${fullPath}`;
  }

  async getFile(path: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, path);
    return fs.promises.readFile(fullPath);
  }

  async deleteFile(path: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, path);
    await fs.promises.unlink(fullPath);
  }
}
```

#### **Production Environment - AWS S3**
```typescript
// AWS S3 storage service
@Injectable()
export class S3StorageService implements StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
      Metadata: {
        originalName: file.originalname,
        size: file.size.toString(),
      },
    });

    await this.s3Client.send(command);
    return `s3://${this.bucketName}/${path}`;
  }

  async getFile(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    const response = await this.s3Client.send(command);
    return Buffer.from(await response.Body.transformToByteArray());
  }

  async deleteFile(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
```

#### **Production Environment - Wasabi**
```typescript
// Wasabi S3-compatible storage service
@Injectable()
export class WasabiStorageService implements StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('WASABI_REGION'),
      endpoint: `https://s3.${this.configService.get('WASABI_REGION')}.wasabisys.com`,
      credentials: {
        accessKeyId: this.configService.get('WASABI_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('WASABI_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // Required for Wasabi
    });
    this.bucketName = this.configService.get('WASABI_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
      Metadata: {
        originalName: file.originalname,
        size: file.size.toString(),
      },
    });

    await this.s3Client.send(command);
    return `wasabi://${this.bucketName}/${path}`;
  }

  async getFile(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    const response = await this.s3Client.send(command);
    return Buffer.from(await response.Body.transformToByteArray());
  }

  async deleteFile(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
```

#### **Storage Service Factory**
```typescript
// Storage service factory for environment-based selection
@Injectable()
export class StorageServiceFactory {
  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private s3StorageService: S3StorageService,
    private wasabiStorageService: WasabiStorageService,
  ) {}

  createStorageService(): StorageService {
    const storageProvider = this.configService.get('STORAGE_PROVIDER', 'local');

    switch (storageProvider) {
      case 's3':
        return this.s3StorageService;
      case 'wasabi':
        return this.wasabiStorageService;
      case 'local':
      default:
        return this.localStorageService;
    }
  }
}

// Storage service interface
export interface StorageService {
  uploadFile(file: Express.Multer.File, path: string): Promise<string>;
  getFile(path: string): Promise<Buffer>;
  deleteFile(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}
```

### **File Processing & Optimization**

#### **Image Processing Service**
```typescript
// Image processing service with optimization
@Injectable()
export class ImageProcessingService {
  async processImage(buffer: Buffer, options: ImageProcessingOptions): Promise<Buffer> {
    const image = sharp(buffer);

    // Apply transformations based on options
    if (options.resize) {
      image.resize(options.resize.width, options.resize.height, {
        fit: options.resize.fit || 'cover',
        withoutEnlargement: true,
      });
    }

    if (options.format) {
      image.toFormat(options.format, {
        quality: options.quality || 80,
        progressive: true,
      });
    }

    if (options.optimize) {
      image.jpeg({ quality: 80, progressive: true });
    }

    return image.toBuffer();
  }

  async generateThumbnail(buffer: Buffer, size: number = 300): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha,
    };
  }
}
```

#### **File Upload Controller**
```typescript
// File upload controller with validation and processing
@Controller('api/v1/files')
export class FileUploadController {
  constructor(
    private storageServiceFactory: StorageServiceFactory,
    private imageProcessingService: ImageProcessingService,
    private fileValidationService: FileValidationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto,
  ): Promise<FileUploadResponse> {
    // Validate file
    await this.fileValidationService.validateFile(file, uploadDto.type);

    let processedFile = file;

    // Process image if needed
    if (uploadDto.type === 'image' && uploadDto.processImage) {
      const processedBuffer = await this.imageProcessingService.processImage(
        file.buffer,
        uploadDto.imageOptions,
      );
      processedFile = {
        ...file,
        buffer: processedBuffer,
        size: processedBuffer.length,
      };
    }

    // Generate file path
    const filePath = this.generateFilePath(file, uploadDto);

    // Upload to storage
    const storageService = this.storageServiceFactory.createStorageService();
    const storageUrl = await storageService.uploadFile(processedFile, filePath);

    // Generate thumbnail for images
    let thumbnailUrl: string | null = null;
    if (uploadDto.type === 'image' && uploadDto.generateThumbnail) {
      const thumbnailBuffer = await this.imageProcessingService.generateThumbnail(file.buffer);
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg');
      thumbnailUrl = await storageService.uploadFile(
        { ...file, buffer: thumbnailBuffer, originalname: 'thumbnail.jpg' },
        thumbnailPath,
      );
    }

    return {
      id: uuidv4(),
      originalName: file.originalname,
      fileName: path.basename(filePath),
      filePath,
      storageUrl,
      thumbnailUrl,
      size: processedFile.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
    };
  }
}
```

---

## 🏛️ Clean Architecture Implementation

### **Domain Layer (Core Business Logic)**

#### **Entities**
```typescript
// Base entity with common fields
abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

// User entity with business rules
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ default: true })
  isActive: boolean;

  // Business rules and validation
  @BeforeInsert()
  @BeforeUpdate()
  validateEmail() {
    if (!isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }
  }
}
```

#### **Domain Services**
```typescript
// Recipe domain service with business logic
@Injectable()
export class RecipeDomainService {
  async createRecipe(recipeData: CreateRecipeDto, userId: string): Promise<Recipe> {
    // Business rule: Validate recipe complexity
    if (recipeData.difficulty === 'expert' && !this.hasExpertPermissions(userId)) {
      throw new UnauthorizedException('Expert recipes require special permissions');
    }

    // Business rule: Check ingredient availability
    const unavailableIngredients = await this.checkIngredientAvailability(recipeData.ingredients);
    if (unavailableIngredients.length > 0) {
      throw new BadRequestException(`Unavailable ingredients: ${unavailableIngredients.join(', ')}`);
    }

    // Create recipe with business validation
    const recipe = this.recipeRepository.create({
      ...recipeData,
      userId,
      status: RecipeStatus.DRAFT
    });

    return this.recipeRepository.save(recipe);
  }

  async publishRecipe(recipeId: string, userId: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId, userId } });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Business rule: Recipe must be complete before publishing
    if (!this.isRecipeComplete(recipe)) {
      throw new BadRequestException('Recipe is incomplete and cannot be published');
    }

    // Business rule: Check for duplicate recipes
    const duplicate = await this.findDuplicateRecipe(recipe);
    if (duplicate) {
      throw new ConflictException('Similar recipe already exists');
    }

    recipe.status = RecipeStatus.PUBLISHED;
    recipe.publishedAt = new Date();
    
    return this.recipeRepository.save(recipe);
  }
}
```

### **Application Layer (Use Cases)**

#### **Application Services**
```typescript
// Recipe application service orchestrating use cases
@Injectable()
export class RecipeApplicationService {
  constructor(
    private recipeDomainService: RecipeDomainService,
    private recipeRepository: RecipeRepository,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  async createRecipe(createRecipeDto: CreateRecipeDto, userId: string): Promise<RecipeResponseDto> {
    // Use case: Create new recipe
    const recipe = await this.recipeDomainService.createRecipe(createRecipeDto, userId);
    
    // Use case: Index recipe for search
    await this.searchService.indexRecipe(recipe);
    
    // Use case: Send notification to team members
    await this.notificationService.notifyRecipeCreated(recipe);
    
    // Use case: Audit trail
    await this.auditService.logAction({
      userId,
      action: AuditAction.CREATE,
      resourceType: 'Recipe',
      resourceId: recipe.id,
      details: { title: recipe.title }
    });

    return this.mapToResponseDto(recipe);
  }

  async searchRecipes(searchDto: SearchRecipesDto, userId: string): Promise<SearchResultDto> {
    // Use case: Validate search permissions
    await this.validateSearchPermissions(userId, searchDto.scope);
    
    // Use case: Execute search with filters
    const results = await this.searchService.searchRecipes(searchDto);
    
    // Use case: Apply user preferences and personalization
    const personalizedResults = await this.applyUserPreferences(results, userId);
    
    // Use case: Track search analytics
    await this.trackSearchAnalytics(searchDto, results, userId);
    
    return this.mapToSearchResultDto(personalizedResults);
  }
}
```

### **Infrastructure Layer (External Concerns)**

#### **Repository Implementation**
```typescript
// Recipe repository with database operations
@Injectable()
export class RecipeRepositoryImpl implements RecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    private cacheService: CacheService
  ) {}

  async findById(id: string, userId: string): Promise<Recipe | null> {
    // Check cache first
    const cacheKey = `recipe:${id}:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Database query with tenant isolation
    const recipe = await this.recipeRepository.findOne({
      where: { id, userId },
      relations: ['ingredients', 'steps', 'ratings']
    });

    // Cache result
    if (recipe) {
      await this.cacheService.set(cacheKey, recipe, 3600); // 1 hour
    }

    return recipe;
  }

  async searchRecipes(criteria: SearchCriteria): Promise<Recipe[]> {
    const queryBuilder = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('recipe.ratings', 'ratings')
      .where('recipe.userId = :userId', { userId: criteria.userId });

    // Apply search filters
    if (criteria.title) {
      queryBuilder.andWhere('recipe.title ILIKE :title', { title: `%${criteria.title}%` });
    }

    if (criteria.cuisine) {
      queryBuilder.andWhere('recipe.cuisine = :cuisine', { cuisine: criteria.cuisine });
    }

    if (criteria.difficulty) {
      queryBuilder.andWhere('recipe.difficulty = :difficulty', { difficulty: criteria.difficulty });
    }

    // Apply sorting
    queryBuilder.orderBy('recipe.createdAt', 'DESC');

    // Apply pagination
    queryBuilder.skip(criteria.offset).take(criteria.limit);

    return queryBuilder.getMany();
  }
}
```

---

## 🔐 Security Architecture

### **Authentication & Authorization**

#### **JWT Token System**
```typescript
// JWT service with token management
@Injectable()
export class JwtService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService
  ) {}

  async generateTokens(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m'
      }),
      this.jwt.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d'
      })
    ]);

    // Store refresh token in Redis for revocation
    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60 // 7 days
    );

    return { accessToken, refreshToken };
  }

  async validateToken(token: string, secret: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwt.verifyAsync(token, { secret });
      
      // Check if token is revoked
      const isRevoked = await this.redisService.get(`revoked_token:${token}`);
      if (isRevoked) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

#### **Role-Based Access Control**
```typescript
// RBAC guard with granular permissions
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check user permissions
    const userPermissions = await this.userService.getUserPermissions(user.id);
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    return hasAllPermissions;
  }
}
```

### **Data Protection**

#### **Encryption at Rest**
```typescript
// Encryption service for sensitive data
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  async encrypt(text: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  async decrypt(encryptedText: string): Promise<string> {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

## 📊 Database Design

### **Schema Design**

#### **Core Tables**
```sql
-- Users table with tenant isolation
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Recipes table with comprehensive metadata
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    cooking_time INTEGER NOT NULL DEFAULT 0,
    prep_time INTEGER NOT NULL DEFAULT 0,
    servings INTEGER NOT NULL DEFAULT 1,
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    cuisine VARCHAR(50),
    category VARCHAR(50),
    tags TEXT[],
    image_url VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status recipe_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Ingredients table with nutritional data
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES ingredient_categories(id),
    image_url VARCHAR(500),
    nutritional_info JSONB,
    allergens TEXT[],
    dietary_types TEXT[],
    seasonality VARCHAR(50),
    origin VARCHAR(100),
    storage_instructions TEXT,
    shelf_life VARCHAR(100),
    substitutions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

#### **Indexes for Performance**
```sql
-- Performance indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);

CREATE INDEX idx_ingredients_name ON ingredients USING gin(to_tsvector('english', name));
CREATE INDEX idx_ingredients_category_id ON ingredients(category_id);
CREATE INDEX idx_ingredients_allergens ON ingredients USING gin(allergens);

-- Full-text search indexes
CREATE INDEX idx_recipes_search ON recipes USING gin(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);
```

### **Multi-Tenant Architecture**

#### **Tenant Isolation Strategy**
```typescript
// Tenant context middleware
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from subdomain or header
    const tenantId = this.extractTenantId(req);
    
    if (!tenantId) {
      throw new UnauthorizedException('Tenant not identified');
    }

    // Set tenant context for the request
    req.tenantId = tenantId;
    next();
  }

  private extractTenantId(req: Request): string | null {
    // From subdomain
    const subdomain = req.subdomains[0];
    if (subdomain) {
      return subdomain;
    }

    // From header
    const tenantHeader = req.headers['x-tenant-id'];
    if (tenantHeader) {
      return tenantHeader as string;
    }

    return null;
  }
}

// Tenant-aware repository base
export abstract class TenantAwareRepository<T extends BaseEntity> {
  protected addTenantFilter(queryBuilder: SelectQueryBuilder<T>, tenantId: string) {
    if (this.isTenantAware()) {
      queryBuilder.andWhere(`${this.getAlias()}.tenantId = :tenantId`, { tenantId });
    }
    return queryBuilder;
  }

  protected abstract isTenantAware(): boolean;
  protected abstract getAlias(): string;
}
```

---

## 🔄 API Design

### **RESTful API Design**

#### **Resource-Based URLs**
```typescript
// Recipe API endpoints
@Controller('api/v1/recipes')
export class RecipeController {
  @Get()
  async getRecipes(@Query() query: GetRecipesDto): Promise<PaginatedResponse<RecipeDto>> {
    return this.recipeService.getRecipes(query);
  }

  @Get(':id')
  async getRecipe(@Param('id') id: string): Promise<RecipeDto> {
    return this.recipeService.getRecipe(id);
  }

  @Post()
  @UseGuards(AuthGuard, RbacGuard)
  @Permissions(Permission.CREATE_RECIPE)
  async createRecipe(@Body() createRecipeDto: CreateRecipeDto): Promise<RecipeDto> {
    return this.recipeService.createRecipe(createRecipeDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RbacGuard)
  @Permissions(Permission.UPDATE_RECIPE)
  async updateRecipe(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto
  ): Promise<RecipeDto> {
    return this.recipeService.updateRecipe(id, updateRecipeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RbacGuard)
  @Permissions(Permission.DELETE_RECIPE)
  async deleteRecipe(@Param('id') id: string): Promise<void> {
    return this.recipeService.deleteRecipe(id);
  }
}
```

#### **API Response Standards**
```typescript
// Standard API response formats
export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export class PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response handling
@Controller()
export class ErrorController {
  @Get('*')
  handleNotFound() {
    throw new NotFoundException('Endpoint not found');
  }
}

// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      requestId: request.headers['x-request-id'] as string
    };

    response.status(status).json(errorResponse);
  }
}
```

---

## 📈 Performance & Scalability

### **Caching Strategy**

#### **Multi-Layer Caching**
```typescript
// Cache service with multiple layers
@Injectable()
export class CacheService {
  constructor(
    private redisService: RedisService,
    private memoryCache: MemoryCache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache (fastest)
    const memoryResult = this.memoryCache.get<T>(key);
    if (memoryResult) {
      return memoryResult;
    }

    // L2: Redis cache (fast)
    const redisResult = await this.redisService.get<T>(key);
    if (redisResult) {
      // Populate memory cache
      this.memoryCache.set(key, redisResult, 300); // 5 minutes
      return redisResult;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    // Set in both layers
    this.memoryCache.set(key, value, Math.min(ttl, 300));
    await this.redisService.set(key, value, ttl);
  }
}
```

### **Database Optimization**

#### **Query Optimization**
```typescript
// Optimized repository with query caching
@Injectable()
export class OptimizedRecipeRepository {
  async findPopularRecipes(limit: number = 10): Promise<Recipe[]> {
    const cacheKey = `popular_recipes:${limit}`;
    
    // Check cache first
    const cached = await this.cacheService.get<Recipe[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Optimized query with proper joins
    const recipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ratings', 'ratings')
      .leftJoinAndSelect('recipe.views', 'views')
      .select([
        'recipe.id',
        'recipe.title',
        'recipe.imageUrl',
        'recipe.cuisine',
        'recipe.difficulty',
        'AVG(ratings.rating) as avgRating',
        'COUNT(ratings.id) as ratingCount',
        'COUNT(views.id) as viewCount'
      ])
      .groupBy('recipe.id')
      .orderBy('viewCount', 'DESC')
      .addOrderBy('avgRating', 'DESC')
      .limit(limit)
      .getRawMany();

    // Cache result
    await this.cacheService.set(cacheKey, recipes, 1800); // 30 minutes

    return recipes;
  }
}
```

---

## 🔍 Monitoring & Observability

### **Application Monitoring**

#### **Metrics Collection**
```typescript
// Metrics service with Prometheus integration
@Injectable()
export class MetricsService {
  private readonly requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
  });

  private readonly requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route']
  });

  private readonly activeUsers = new Gauge({
    name: 'active_users_total',
    help: 'Total number of active users'
  });

  recordRequest(method: string, route: string, status: number, duration: number) {
    this.requestCounter.inc({ method, route, status });
    this.requestDuration.observe({ method, route }, duration);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }
}
```

#### **Distributed Tracing**
```typescript
// Tracing middleware with OpenTelemetry
@Injectable()
export class TracingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tracer = trace.getTracer('hestia-api');
    const span = tracer.startSpan('http_request', {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.user_agent': req.get('User-Agent'),
        'user.id': req.user?.id
      }
    });

    // Add trace context to request
    req.traceContext = {
      traceId: span.spanContext().traceId,
      spanId: span.spanContext().spanId
    };

    // End span when request completes
    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode
      });
      span.end();
    });

    next();
  }
}
```

---

## 🚀 Deployment Architecture

### **Container Orchestration**

#### **Kubernetes Deployment**
```yaml
# Deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hestia-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hestia-api
  template:
    metadata:
      labels:
        app: hestia-api
    spec:
      containers:
      - name: hestia-api
        image: hestia/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hestia-secrets
              key: database-url
        - name: STORAGE_PROVIDER
          valueFrom:
            secretKeyRef:
              name: hestia-secrets
              key: storage-provider
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### **Service Mesh Configuration**
```yaml
# Istio service mesh configuration
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: hestia-api
spec:
  hosts:
  - api.hestia.com
  gateways:
  - hestia-gateway
  http:
  - route:
    - destination:
        host: hestia-api
        port:
          number: 3000
      weight: 100
    retries:
      attempts: 3
      perTryTimeout: 2s
    timeout: 30s
    corsPolicy:
      allowOrigins:
      - exact: https://app.hestia.com
      allowMethods:
      - GET
      - POST
      - PUT
      - DELETE
      allowHeaders:
      - authorization
      - content-type
```

---

## 📚 Related Documents

- [01_PROJECT_OVERVIEW_AND_VISION.md](01_PROJECT_OVERVIEW_AND_VISION.md)
- [02_BUSINESS_REQUIREMENTS_AND_USE_CASES.md](02_BUSINESS_REQUIREMENTS_AND_USE_CASES.md)
- [03_FEATURE_CATALOG_AND_SPECIFICATIONS.md](03_FEATURE_CATALOG_AND_SPECIFICATIONS.md)
- [05_DOMAIN_MODEL_AND_ENTITY_REFERENCE.md](05_DOMAIN_MODEL_AND_ENTITY_REFERENCE.md)
- [06_TECHNICAL_GUIDELINES_AND_RESTRICTIONS.md](06_TECHNICAL_GUIDELINES_AND_RESTRICTIONS.md)

---

*Document Version: 1.0.0*  
*Last Updated: December 28, 2024*  
*Status: Technical Design Document*  
*Next Review: January 28, 2025*