# Hestia Enterprise SaaS Platform - Localization & Internationalization

## 📋 Document Information

| **Document Type** | Localization & Internationalization |
|-------------------|-------------------------------------|
| **Version** | 1.0.0 |
| **Last Updated** | December 28, 2024 |
| **Next Review** | January 28, 2025 |
| **Document Owner** | Localization Team |
| **Stakeholders** | Development Team, UX/UI Team, Content Team, Global Customers |
| **Classification** | Localization & i18n Document |

---

## 🎯 Executive Summary

This document defines the comprehensive localization and internationalization strategy for the Hestia Enterprise SaaS Platform. It ensures seamless multi-language support, cultural adaptation, and global accessibility for enterprise customers worldwide.

### **Localization Strategy**
- **Multi-Language Support**: English and Arabic with expandable framework
- **Cultural Adaptation**: Regional preferences and formatting
- **Translation Management**: Complete translation workflow
- **RTL/LTR Support**: Full bidirectional text support
- **Enterprise Scale**: Scalable translation management

---

## 🌍 Supported Languages & Regions

### **Current Language Support**

| **Language** | **Code** | **Direction** | **Status** | **Coverage** |
|--------------|----------|---------------|------------|--------------|
| **English** | `en` | LTR | ✅ Complete | 100% |
| **Arabic** | `ar` | RTL | ✅ Complete | 100% |

### **Future Language Roadmap**

| **Language** | **Code** | **Direction** | **Planned** | **Priority** |
|--------------|----------|---------------|-------------|--------------|
| **Spanish** | `es` | LTR | Q2 2025 | High |
| **French** | `fr` | LTR | Q3 2025 | High |
| **German** | `de` | LTR | Q4 2025 | Medium |
| **Chinese (Simplified)** | `zh-CN` | LTR | Q1 2026 | Medium |
| **Japanese** | `ja` | LTR | Q2 2026 | Medium |
| **Hindi** | `hi` | LTR | Q3 2026 | Low |
| **Portuguese** | `pt` | LTR | Q4 2026 | Low |

---

## 🏗️ Localization Architecture

### **Core Localization System**

```
┌─────────────────────────────────────────────────────────────┐
│                 🌐 Localization Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Locale        │  │   Translation   │  │   Cultural  │ │
│  │   Management    │  │   Engine        │  │   Adaptation│ │
│  │                 │  │                 │  │             │ │
│  │ • Locale        │  │ • Translation   │  │ • Date/Time │ │
│  │   Detection     │  │   Loading       │  │   Formats   │ │
│  │ • Fallback      │  │ • Fallback      │  │ • Number    │ │
│  │   Resolution    │  │   Resolution    │  │   Formats   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│                🔧 Translation Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Recipe        │  │   Ingredient    │  │   UI        │ │
│  │   Translation   │  │   Translation   │  │   Translation│ │
│  │                 │  │                 │  │             │ │
│  │ • Title         │  │ • Name          │  │ • Labels    │ │
│  │ • Description   │  │ • Description   │  │ • Messages  │ │
│  │ • Instructions  │  │ • Storage       │  │ • Errors    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│               💾 Database Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Translation   │  │   Locale        │  │   Cultural  │ │
│  │   Tables        │  │   Configuration │  │   Settings  │ │
│  │                 │  │                 │  │             │ │
│  │ • Recipe        │  │ • Supported     │  │ • Regional  │ │
│  │   Translations  │  │   Locales       │  │   Preferences│ │
│  │ • Ingredient    │  │ • Default       │  │ • Formatting│ │
│  │   Translations  │  │   Locale        │  │   Rules     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **Locale Management**

#### **Locale Configuration**
```typescript
// Locale configuration
export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  fallback: string;
}

// Supported locales
export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '$'
    },
    fallback: 'en'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'د.ك'
    },
    fallback: 'en'
  }
};

// Locale validation
export function isValidLocale(locale: string): boolean {
  return Object.keys(SUPPORTED_LOCALES).includes(locale);
}

// Get locale configuration
export function getLocaleConfig(locale: string): LocaleConfig {
  if (!isValidLocale(locale)) {
    return SUPPORTED_LOCALES.en; // Default fallback
  }
  return SUPPORTED_LOCALES[locale];
}
```

#### **Locale Detection Service**
```typescript
// Locale detection service
@Injectable()
export class LocaleDetectionService {
  async detectUserLocale(request: Request): Promise<string> {
    // Priority order: User preference > Accept-Language > Default
    
    // 1. Check user preference from database
    if (request.user) {
      const userLocale = await this.getUserLocale(request.user.id);
      if (userLocale && isValidLocale(userLocale)) {
        return userLocale;
      }
    }
    
    // 2. Check Accept-Language header
    const acceptLanguage = request.headers['accept-language'];
    if (acceptLanguage) {
      const detectedLocale = this.parseAcceptLanguage(acceptLanguage);
      if (detectedLocale && isValidLocale(detectedLocale)) {
        return detectedLocale;
      }
    }
    
    // 3. Check IP-based geolocation
    const geoLocale = await this.detectLocaleByIP(request.ip);
    if (geoLocale && isValidLocale(geoLocale)) {
      return geoLocale;
    }
    
    // 4. Default fallback
    return 'en';
  }

  private parseAcceptLanguage(acceptLanguage: string): string | null {
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .filter(lang => lang.length > 0);
    
    for (const lang of languages) {
      const locale = lang.split('-')[0]; // Extract primary language
      if (isValidLocale(locale)) {
        return locale;
      }
    }
    
    return null;
  }

  private async detectLocaleByIP(ip: string): Promise<string | null> {
    try {
      const geoData = await this.geoIPService.lookup(ip);
      const countryLocale = this.mapCountryToLocale(geoData.country);
      return countryLocale;
    } catch (error) {
      return null;
    }
  }
}
```

### **Translation Management**

#### **Translation Service**
```typescript
// Translation service
@Injectable()
export class TranslationService {
  constructor(
    private translationRepository: TranslationRepository,
    private cacheService: CacheService
  ) {}

  async translate(
    key: string,
    locale: string,
    context?: TranslationContext
  ): Promise<string> {
    // Check cache first
    const cacheKey = `translation:${key}:${locale}`;
    const cached = await this.cacheService.get<string>(cacheKey);
    if (cached) {
      return this.interpolate(cached, context);
    }

    // Get translation from database
    const translation = await this.translationRepository.findByKeyAndLocale(key, locale);
    
    if (translation) {
      // Cache the translation
      await this.cacheService.set(cacheKey, translation.value, 3600);
      return this.interpolate(translation.value, context);
    }

    // Fallback to default locale
    const fallbackLocale = getLocaleConfig(locale).fallback;
    if (fallbackLocale !== locale) {
      return this.translate(key, fallbackLocale, context);
    }

    // Return key if no translation found
    return key;
  }

  async translateRecipe(recipe: Recipe, locale: string): Promise<LocalizedRecipe> {
    const translation = await this.translationRepository.findRecipeTranslation(
      recipe.id,
      locale
    );

    return {
      ...recipe,
      title: translation?.title || recipe.title,
      description: translation?.description || recipe.description,
      instructions: translation?.instructions || recipe.instructions,
      translation: translation
    };
  }

  async translateIngredient(ingredient: Ingredient, locale: string): Promise<LocalizedIngredient> {
    const translation = await this.translationRepository.findIngredientTranslation(
      ingredient.id,
      locale
    );

    return {
      ...ingredient,
      name: translation?.name || ingredient.name,
      description: translation?.description || ingredient.description,
      storageInstructions: translation?.storageInstructions || ingredient.storageInstructions,
      substitutions: translation?.substitutions || ingredient.substitutions,
      translation: translation
    };
  }

  private interpolate(text: string, context?: TranslationContext): string {
    if (!context) {
      return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return context[key] || match;
    });
  }
}
```

#### **Translation Repository**
```typescript
// Translation repository
@Injectable()
export class TranslationRepositoryImpl implements TranslationRepository {
  async findByKeyAndLocale(key: string, locale: string): Promise<Translation | null> {
    return await this.translationRepository.findOne({
      where: { key, locale }
    });
  }

  async findRecipeTranslation(recipeId: string, locale: string): Promise<RecipeTranslation | null> {
    return await this.recipeTranslationRepository.findOne({
      where: { recipeId, locale }
    });
  }

  async findIngredientTranslation(ingredientId: string, locale: string): Promise<IngredientTranslation | null> {
    return await this.ingredientTranslationRepository.findOne({
      where: { ingredientId, locale }
    });
  }

  async createTranslation(translation: CreateTranslationDto): Promise<Translation> {
    const newTranslation = this.translationRepository.create(translation);
    return await this.translationRepository.save(newTranslation);
  }

  async updateTranslation(id: string, updates: UpdateTranslationDto): Promise<Translation> {
    await this.translationRepository.update(id, updates);
    return await this.translationRepository.findOne({ where: { id } });
  }

  async deleteTranslation(id: string): Promise<void> {
    await this.translationRepository.delete(id);
  }
}
```

---

## 🌐 Cultural Adaptation

### **Date and Time Formatting**

#### **Date/Time Service**
```typescript
// Date/time formatting service
@Injectable()
export class DateTimeService {
  formatDate(date: Date, locale: string): string {
    const config = getLocaleConfig(locale);
    
    switch (config.dateFormat) {
      case 'MM/DD/YYYY':
        return date.toLocaleDateString('en-US');
      case 'DD/MM/YYYY':
        return date.toLocaleDateString('en-GB');
      default:
        return date.toLocaleDateString(locale);
    }
  }

  formatTime(time: Date, locale: string): string {
    const config = getLocaleConfig(locale);
    
    switch (config.timeFormat) {
      case 'HH:mm':
        return time.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      case 'hh:mm A':
        return time.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      default:
        return time.toLocaleTimeString(locale);
    }
  }

  formatDateTime(dateTime: Date, locale: string): string {
    const date = this.formatDate(dateTime, locale);
    const time = this.formatTime(dateTime, locale);
    return `${date} ${time}`;
  }
}
```

### **Number and Currency Formatting**

#### **Number Formatting Service**
```typescript
// Number formatting service
@Injectable()
export class NumberFormatService {
  formatNumber(number: number, locale: string): string {
    const config = getLocaleConfig(locale);
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(number);
  }

  formatCurrency(amount: number, locale: string, currency: string = 'USD'): string {
    const config = getLocaleConfig(locale);
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatPercentage(value: number, locale: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value / 100);
  }
}
```

### **Text Direction Support**

#### **RTL/LTR Support**
```typescript
// Text direction service
@Injectable()
export class TextDirectionService {
  getDirection(locale: string): 'ltr' | 'rtl' {
    const config = getLocaleConfig(locale);
    return config.direction;
  }

  isRTL(locale: string): boolean {
    return this.getDirection(locale) === 'rtl';
  }

  // CSS class for RTL support
  getDirectionClass(locale: string): string {
    return this.isRTL(locale) ? 'rtl' : 'ltr';
  }

  // Mirror layout for RTL
  getMirroredLayout(locale: string): boolean {
    return this.isRTL(locale);
  }
}
```

---

## 📝 Translation Workflow

### **Translation Management System**

#### **Translation Workflow**
```typescript
// Translation workflow service
@Injectable()
export class TranslationWorkflowService {
  async createTranslationRequest(
    content: TranslationRequest
  ): Promise<TranslationRequest> {
    const request = await this.translationRequestRepository.create({
      ...content,
      status: TranslationStatus.PENDING,
      createdAt: new Date()
    });

    // Notify translation team
    await this.notifyTranslationTeam(request);

    return request;
  }

  async processTranslationRequest(
    requestId: string,
    translation: string,
    translatorId: string
  ): Promise<void> {
    const request = await this.translationRequestRepository.findById(requestId);
    
    // Update request status
    await this.translationRequestRepository.update(requestId, {
      status: TranslationStatus.TRANSLATED,
      translatedText: translation,
      translatorId,
      translatedAt: new Date()
    });

    // Create translation record
    await this.translationRepository.create({
      key: request.key,
      locale: request.targetLocale,
      value: translation,
      context: request.context
    });

    // Clear cache
    await this.cacheService.delete(`translation:${request.key}:${request.targetLocale}`);

    // Notify content owner
    await this.notifyContentOwner(request, translation);
  }

  async reviewTranslation(
    translationId: string,
    approved: boolean,
    reviewerId: string,
    comments?: string
  ): Promise<void> {
    const translation = await this.translationRepository.findById(translationId);
    
    await this.translationRepository.update(translationId, {
      status: approved ? TranslationStatus.APPROVED : TranslationStatus.REJECTED,
      reviewerId,
      reviewedAt: new Date(),
      reviewComments: comments
    });

    if (approved) {
      // Activate translation
      await this.activateTranslation(translationId);
    }
  }
}
```

### **Translation Quality Assurance**

#### **Quality Control Service**
```typescript
// Translation quality control
@Injectable()
export class TranslationQualityService {
  async validateTranslation(
    original: string,
    translation: string,
    locale: string
  ): Promise<QualityReport> {
    const report: QualityReport = {
      score: 100,
      issues: [],
      suggestions: []
    };

    // Check for missing placeholders
    const originalPlaceholders = this.extractPlaceholders(original);
    const translationPlaceholders = this.extractPlaceholders(translation);
    
    const missingPlaceholders = originalPlaceholders.filter(
      p => !translationPlaceholders.includes(p)
    );

    if (missingPlaceholders.length > 0) {
      report.score -= 20;
      report.issues.push({
        type: 'MISSING_PLACEHOLDER',
        message: `Missing placeholders: ${missingPlaceholders.join(', ')}`
      });
    }

    // Check for length consistency
    const lengthRatio = translation.length / original.length;
    if (lengthRatio < 0.5 || lengthRatio > 2.0) {
      report.score -= 10;
      report.issues.push({
        type: 'LENGTH_INCONSISTENCY',
        message: `Translation length ratio: ${lengthRatio.toFixed(2)}`
      });
    }

    // Check for locale-specific formatting
    const formattingIssues = this.checkLocaleFormatting(translation, locale);
    report.issues.push(...formattingIssues);
    report.score -= formattingIssues.length * 5;

    return report;
  }

  private extractPlaceholders(text: string): string[] {
    const matches = text.match(/\{(\w+)\}/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }

  private checkLocaleFormatting(text: string, locale: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const config = getLocaleConfig(locale);

    // Check for proper currency formatting
    if (config.numberFormat.currency && !text.includes(config.numberFormat.currency)) {
      issues.push({
        type: 'CURRENCY_FORMATTING',
        message: `Missing currency symbol: ${config.numberFormat.currency}`
      });
    }

    return issues;
  }
}
```

---

## 🎨 UI/UX Localization

### **Component Localization**

#### **Localized Components**
```typescript
// Localized component base
export abstract class LocalizedComponent {
  @Input() locale: string = 'en';
  
  protected getDirection(): 'ltr' | 'rtl' {
    return getLocaleConfig(this.locale).direction;
  }

  protected getDirectionClass(): string {
    return this.getDirection() === 'rtl' ? 'rtl' : 'ltr';
  }

  protected formatDate(date: Date): string {
    return this.dateTimeService.formatDate(date, this.locale);
  }

  protected formatNumber(number: number): string {
    return this.numberFormatService.formatNumber(number, this.locale);
  }
}

// Localized recipe card component
@Component({
  selector: 'app-localized-recipe-card',
  template: `
    <div [class]="getDirectionClass()" class="recipe-card">
      <h3 [dir]="getDirection()">{{ recipe.title }}</h3>
      <p [dir]="getDirection()">{{ recipe.description }}</p>
      <div class="recipe-meta">
        <span>{{ 'COOKING_TIME' | translate:locale }}: {{ recipe.cookingTime }} {{ 'MINUTES' | translate:locale }}</span>
        <span>{{ 'DIFFICULTY' | translate:locale }}: {{ recipe.difficulty | translate:locale }}</span>
      </div>
    </div>
  `
})
export class LocalizedRecipeCardComponent extends LocalizedComponent {
  @Input() recipe: LocalizedRecipe;
}
```

### **Responsive Design for RTL**

#### **RTL CSS Support**
```scss
// RTL support styles
.rtl {
  direction: rtl;
  text-align: right;
  
  .recipe-card {
    .recipe-meta {
      flex-direction: row-reverse;
    }
    
    .ingredient-list {
      padding-right: 0;
      padding-left: 20px;
    }
    
    .step-number {
      margin-right: 0;
      margin-left: 10px;
    }
  }
  
  .navigation {
    .nav-item {
      margin-right: 0;
      margin-left: 15px;
    }
  }
  
  .form-group {
    label {
      text-align: right;
    }
    
    input, textarea, select {
      text-align: right;
    }
  }
  
  .button-group {
    .btn {
      margin-right: 0;
      margin-left: 10px;
      
      &:first-child {
        margin-left: 0;
      }
    }
  }
}
```

---

## 📊 Translation Analytics

### **Translation Coverage**

#### **Coverage Analysis**
```typescript
// Translation coverage service
@Injectable()
export class TranslationCoverageService {
  async getCoverageReport(locale: string): Promise<CoverageReport> {
    const totalKeys = await this.translationRepository.getTotalKeys();
    const translatedKeys = await this.translationRepository.getTranslatedKeys(locale);
    const coverage = (translatedKeys / totalKeys) * 100;

    return {
      locale,
      totalKeys,
      translatedKeys,
      coverage,
      missingKeys: totalKeys - translatedKeys,
      lastUpdated: await this.getLastTranslationDate(locale)
    };
  }

  async getMissingTranslations(locale: string): Promise<MissingTranslation[]> {
    const missing = await this.translationRepository.getMissingTranslations(locale);
    
    return missing.map(item => ({
      key: item.key,
      context: item.context,
      sourceText: item.sourceText,
      priority: this.calculatePriority(item)
    }));
  }

  private calculatePriority(item: any): 'high' | 'medium' | 'low' {
    // Priority based on usage frequency and content type
    if (item.usageCount > 1000) return 'high';
    if (item.usageCount > 100) return 'medium';
    return 'low';
  }
}
```

### **Translation Performance**

#### **Performance Monitoring**
```typescript
// Translation performance monitoring
@Injectable()
export class TranslationPerformanceService {
  async monitorTranslationPerformance(): Promise<PerformanceReport> {
    const metrics = {
      cacheHitRate: await this.calculateCacheHitRate(),
      averageResponseTime: await this.calculateAverageResponseTime(),
      fallbackUsage: await this.calculateFallbackUsage(),
      translationErrors: await this.getTranslationErrors()
    };

    return {
      timestamp: new Date(),
      metrics,
      recommendations: await this.generateRecommendations(metrics)
    };
  }

  private async calculateCacheHitRate(): Promise<number> {
    const hits = await this.cacheService.getStats('hits');
    const misses = await this.cacheService.getStats('misses');
    return hits / (hits + misses) * 100;
  }

  private async calculateAverageResponseTime(): Promise<number> {
    const responseTimes = await this.translationRepository.getResponseTimes();
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }
}
```

---

## 🔧 API Localization

### **Localized API Endpoints**

#### **API Localization Service**
```typescript
// API localization service
@Injectable()
export class APILocalizationService {
  async getLocalizedRecipe(recipeId: string, locale: string): Promise<LocalizedRecipe> {
    const recipe = await this.recipeService.getRecipe(recipeId);
    return await this.translationService.translateRecipe(recipe, locale);
  }

  async getLocalizedIngredient(ingredientId: string, locale: string): Promise<LocalizedIngredient> {
    const ingredient = await this.ingredientService.getIngredient(ingredientId);
    return await this.translationService.translateIngredient(ingredient, locale);
  }

  async searchLocalizedRecipes(
    query: string,
    locale: string,
    filters?: SearchFilters
  ): Promise<LocalizedRecipe[]> {
    const recipes = await this.recipeService.searchRecipes(query, filters);
    
    return await Promise.all(
      recipes.map(recipe => this.translationService.translateRecipe(recipe, locale))
    );
  }

  async getLocalizedCategories(locale: string): Promise<LocalizedCategory[]> {
    const categories = await this.categoryService.getCategories();
    
    return await Promise.all(
      categories.map(category => this.translationService.translateCategory(category, locale))
    );
  }
}
```

### **Localized API Response**

#### **Response Formatting**
```typescript
// Localized API response
export interface LocalizedAPIResponse<T> {
  data: T;
  locale: string;
  direction: 'ltr' | 'rtl';
  metadata: {
    translationCoverage: number;
    fallbackUsed: boolean;
    timestamp: string;
  };
}

// API response interceptor
@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const locale = request.locale || 'en';
    
    return next.handle().pipe(
      map(data => {
        if (this.shouldLocalize(data)) {
          return this.localizeResponse(data, locale);
        }
        return data;
      })
    );
  }

  private shouldLocalize(data: any): boolean {
    return data && typeof data === 'object' && !data.locale;
  }

  private localizeResponse(data: any, locale: string): LocalizedAPIResponse<any> {
    return {
      data,
      locale,
      direction: getLocaleConfig(locale).direction,
      metadata: {
        translationCoverage: this.calculateCoverage(data, locale),
        fallbackUsed: this.checkFallbackUsed(data, locale),
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

---

## 📚 Related Documents

- [01_PROJECT_OVERVIEW_AND_VISION.md](01_PROJECT_OVERVIEW_AND_VISION.md)
- [02_BUSINESS_REQUIREMENTS_AND_USE_CASES.md](02_BUSINESS_REQUIREMENTS_AND_USE_CASES.md)
- [03_FEATURE_CATALOG_AND_SPECIFICATIONS.md](03_FEATURE_CATALOG_AND_SPECIFICATIONS.md)
- [04_TECHNICAL_ARCHITECTURE_AND_DESIGN.md](04_TECHNICAL_ARCHITECTURE_AND_DESIGN.md)
- [05_DOMAIN_MODEL_AND_ENTITY_REFERENCE.md](05_DOMAIN_MODEL_AND_ENTITY_REFERENCE.md)
- [06_API_AND_INTEGRATION_HANDBOOK.md](06_API_AND_INTEGRATION_HANDBOOK.md)
- [07_SECURITY_COMPLIANCE_AND_DATA_PROTECTION.md](07_SECURITY_COMPLIANCE_AND_DATA_PROTECTION.md)

---

*Document Version: 1.0.0*  
*Last Updated: December 28, 2024*  
*Status: Localization & i18n Document*  
*Next Review: January 28, 2025* 