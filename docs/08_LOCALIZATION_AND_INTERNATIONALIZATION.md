# Localization and Internationalization

## 📋 Document Information

| **Document Type** | Localization and Internationalization |
| ----------------- | ------------------------------------- |
| **Version**       | 1.1.0                                 |
| **Last Updated**  | December 28, 2024                     |
| **Owner**         | Development Team                       |
| **Status**        | Phase 1 - 90% Complete                |

---

## 🎯 Executive Summary

This document outlines the localization and internationalization (i18n) strategy for the Hestia Platform, ensuring the application can serve users worldwide with appropriate language support, cultural adaptations, and regional preferences.

### **Current Implementation Status: Phase 1 - 90% Complete**

The foundational internationalization framework has been established, providing the infrastructure for multi-language support:

- ✅ **i18n Framework**: NestJS i18n module integration with translation management
- ✅ **Language Support**: English as primary language with translation structure
- ✅ **Date/Time Handling**: UTC-based timestamps with timezone awareness
- ✅ **Number Formatting**: Standardized number and currency formatting
- ✅ **API Localization**: Localized API responses and error messages
- ✅ **Database Design**: Multi-language content support in database schema

---

## 🌍 Supported Languages and Regions

### **Phase 1 Languages (Current)**

| Language | Code | Region | Status | Priority |
|----------|------|--------|--------|----------|
| **English** | `en` | US | ✅ Complete | High |
| **English** | `en-GB` | UK | 🔄 Planned | Medium |
| **Spanish** | `es` | ES | 🔄 Planned | High |
| **French** | `fr` | FR | 🔄 Planned | High |
| **German** | `de` | DE | 🔄 Planned | Medium |
| **Italian** | `it` | IT | 🔄 Planned | Medium |

### **Phase 2 Languages (Future)**

| Language | Code | Region | Status | Priority |
|----------|------|--------|--------|----------|
| **Portuguese** | `pt` | BR | 🔄 Planned | Medium |
| **Dutch** | `nl` | NL | 🔄 Planned | Low |
| **Russian** | `ru` | RU | 🔄 Planned | Medium |
| **Japanese** | `ja` | JP | 🔄 Planned | High |
| **Korean** | `ko` | KR | 🔄 Planned | Medium |
| **Chinese** | `zh-CN` | CN | 🔄 Planned | High |

### **Phase 3 Languages (Future)**

| Language | Code | Region | Status | Priority |
|----------|------|--------|--------|----------|
| **Arabic** | `ar` | SA | 🔄 Planned | Medium |
| **Hindi** | `hi` | IN | 🔄 Planned | Medium |
| **Turkish** | `tr` | TR | 🔄 Planned | Low |
| **Polish** | `pl` | PL | 🔄 Planned | Low |
| **Swedish** | `sv` | SE | 🔄 Planned | Low |
| **Norwegian** | `no` | NO | 🔄 Planned | Low |

---

## 🏗️ Technical Implementation

### **✅ Implemented Features (Phase 1)**

#### **i18n Framework Setup**
- **Framework**: NestJS i18n module integration
- **Translation Files**: JSON-based translation files
- **Language Detection**: Automatic language detection from headers
- **Fallback Language**: English as default fallback
- **Translation Keys**: Structured translation key hierarchy

#### **API Localization**
- **Response Messages**: Localized API response messages
- **Error Messages**: Localized error messages and validation
- **Status Messages**: Localized success and status messages
- **Documentation**: Localized API documentation

#### **Database Localization**
- **Multi-language Content**: Database schema supporting multiple languages
- **Content Translation**: Recipe and ingredient content in multiple languages
- **Metadata Localization**: Localized metadata and descriptions
- **Search Support**: Multi-language search capabilities

#### **Date and Time Handling**
- **UTC Storage**: All timestamps stored in UTC
- **Timezone Support**: User timezone preference handling
- **Date Formatting**: Localized date and time formatting
- **Calendar Support**: Regional calendar preferences

#### **Number and Currency Formatting**
- **Number Formatting**: Localized number formatting (decimals, thousands)
- **Currency Support**: Multi-currency support with exchange rates
- **Measurement Units**: Metric and imperial unit support
- **Regional Preferences**: Regional formatting preferences

### **🔄 Planned Features (Future Phases)**

#### **Advanced Localization (Phase 2)**
- **Dynamic Content**: Real-time content translation
- **User Preferences**: Language and regional preference management
- **Content Curation**: Region-specific content recommendations
- **Cultural Adaptations**: Cultural-specific features and content

#### **Translation Management (Phase 3)**
- **Translation Workflow**: Automated translation workflow
- **Quality Assurance**: Translation quality validation
- **Version Control**: Translation version management
- **Collaboration Tools**: Translation collaboration platform

---

## 📁 Translation File Structure

### **File Organization**
```
src/
├── i18n/
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── user.json
│   │   │   ├── recipe.json
│   │   │   ├── ingredient.json
│   │   │   ├── shopping.json
│   │   │   ├── errors.json
│   │   │   └── validation.json
│   │   ├── es/
│   │   │   └── ...
│   │   ├── fr/
│   │   │   └── ...
│   │   └── de/
│   │       └── ...
│   ├── i18n.config.ts
│   └── i18n.module.ts
```

### **Translation Key Structure**
```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit"
    },
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred",
      "loading": "Loading..."
    }
  },
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot Password?"
    },
    "register": {
      "title": "Register",
      "confirmPassword": "Confirm Password",
      "terms": "I agree to the terms and conditions"
    }
  },
  "errors": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "minLength": "Minimum length is {{min}} characters",
      "maxLength": "Maximum length is {{max}} characters"
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailExists": "Email already exists",
      "weakPassword": "Password is too weak"
    }
  }
}
```

---

## 🌍 Regional Adaptations

### **Cultural Considerations**

#### **North America (US/Canada)**
- **Date Format**: MM/DD/YYYY
- **Time Format**: 12-hour (AM/PM)
- **Currency**: USD/CAD
- **Units**: Imperial (pounds, ounces, cups)
- **Holidays**: Thanksgiving, Independence Day

#### **Europe (UK, Germany, France, etc.)**
- **Date Format**: DD/MM/YYYY
- **Time Format**: 24-hour
- **Currency**: EUR, GBP
- **Units**: Metric (grams, milliliters)
- **Holidays**: Christmas, Easter, local holidays

#### **Asia (Japan, Korea, China)**
- **Date Format**: YYYY/MM/DD
- **Time Format**: 24-hour
- **Currency**: JPY, KRW, CNY
- **Units**: Metric with local adaptations
- **Holidays**: Lunar New Year, local festivals

### **Content Localization**

#### **Recipe Content**
- **Ingredient Names**: Local ingredient names and alternatives
- **Measurement Units**: Regional measurement preferences
- **Cooking Methods**: Local cooking techniques and terminology
- **Cultural Context**: Regional food culture and traditions

#### **User Interface**
- **Text Direction**: RTL support for Arabic and Hebrew
- **Font Support**: Unicode support for all languages
- **Layout Adaptations**: Cultural layout preferences
- **Color Schemes**: Cultural color associations

---

## 🔧 Technical Configuration

### **NestJS i18n Configuration**
```typescript
// i18n.config.ts
export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, '/i18n/locales/'),
    watch: true,
  },
  typesOutputPath: path.join(__dirname, '../src/generated/i18n.generated.ts'),
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    { use: HeaderResolver, options: ['accept-language'] },
    AcceptLanguageResolver,
  ],
  formatters: {
    number: IntlNumberFormatter,
    date: IntlDateFormatter,
  },
};
```

### **Translation Service Usage**
```typescript
// Example usage in controllers
@Get()
async getRecipes(@I18n() i18n: I18nService) {
  return {
    message: i18n.t('recipe.list.success'),
    data: await this.recipeService.findAll(),
  };
}

// Example usage in services
async createUser(createUserDto: CreateUserDto, lang: string) {
  const user = await this.userService.create(createUserDto);
  
  return {
    message: this.i18n.t('user.create.success', { lang }),
    data: user,
  };
}
```

### **Database Localization**
```typescript
// Example entity with localization
@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  title: LocalizedContent;

  @Column('jsonb')
  description: LocalizedContent;

  @Column('jsonb')
  instructions: LocalizedContent;

  @Column('jsonb', { nullable: true })
  tags: LocalizedContent[];
}

// Localized content interface
interface LocalizedContent {
  en: string;
  es?: string;
  fr?: string;
  de?: string;
  [key: string]: string | undefined;
}
```

---

## 📊 Translation Management

### **Translation Workflow**

#### **Phase 1: Manual Translation**
1. **Content Creation**: Create content in English
2. **Translation Request**: Request translation for target languages
3. **Translation Review**: Review and validate translations
4. **Implementation**: Implement translations in codebase
5. **Testing**: Test translations in application

#### **Phase 2: Automated Translation**
1. **Content Creation**: Create content in English
2. **Auto-Translation**: Use AI translation services
3. **Human Review**: Human review of automated translations
4. **Quality Assurance**: Translation quality validation
5. **Implementation**: Deploy validated translations

#### **Phase 3: Community Translation**
1. **Translation Platform**: Community translation platform
2. **Crowdsourcing**: Community-driven translation efforts
3. **Moderation**: Translation moderation and approval
4. **Quality Control**: Community quality control
5. **Implementation**: Deploy community translations

### **Translation Quality Assurance**

#### **Quality Metrics**
- **Accuracy**: Translation accuracy and meaning preservation
- **Consistency**: Consistent terminology across translations
- **Completeness**: Complete translation coverage
- **Cultural Appropriateness**: Cultural sensitivity and appropriateness

#### **Validation Process**
1. **Automated Checks**: Automated translation validation
2. **Human Review**: Human review of translations
3. **Cultural Review**: Cultural appropriateness review
4. **User Testing**: User acceptance testing
5. **Continuous Improvement**: Ongoing translation improvement

---

## 🌍 Regional Features

### **Regional Content Curation**

#### **Recipe Recommendations**
- **Local Ingredients**: Recipes using local ingredients
- **Seasonal Content**: Seasonal recipe recommendations
- **Cultural Dishes**: Traditional and cultural dishes
- **Regional Preferences**: Regional taste preferences

#### **Shopping Integration**
- **Local Stores**: Integration with local grocery stores
- **Regional Products**: Regional product availability
- **Local Pricing**: Local price information
- **Regional Brands**: Regional brand preferences

### **Regional Compliance**

#### **Data Protection**
- **GDPR Compliance**: European data protection compliance
- **CCPA Compliance**: California privacy compliance
- **Local Regulations**: Regional data protection laws
- **Privacy Preferences**: Regional privacy preferences

#### **Content Regulations**
- **Food Labeling**: Regional food labeling requirements
- **Nutrition Standards**: Regional nutrition standards
- **Allergen Information**: Regional allergen requirements
- **Health Claims**: Regional health claim regulations

---

## 📈 Success Metrics

### **Localization Metrics**
- **Language Coverage**: Percentage of content translated
- **Translation Quality**: Translation accuracy scores
- **User Adoption**: User adoption by language/region
- **Content Engagement**: Regional content engagement rates

### **Technical Metrics**
- **Performance**: Localization impact on performance
- **Error Rates**: Localization-related error rates
- **User Experience**: Regional user experience scores
- **Accessibility**: Regional accessibility compliance

### **Business Metrics**
- **Market Penetration**: Market penetration by region
- **User Satisfaction**: Regional user satisfaction scores
- **Revenue Growth**: Revenue growth by region
- **Customer Retention**: Regional customer retention rates

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation (90% Complete)**
- ✅ **i18n Framework**: NestJS i18n module setup
- ✅ **English Support**: Complete English language support
- ✅ **API Localization**: Localized API responses
- ✅ **Database Design**: Multi-language database schema
- ✅ **Basic Configuration**: Basic i18n configuration

### **Phase 2: Core Languages (Q1 2025)**
- 🔄 **Spanish Support**: Complete Spanish translation
- 🔄 **French Support**: Complete French translation
- 🔄 **German Support**: Complete German translation
- 🔄 **User Preferences**: Language preference management
- 🔄 **Content Translation**: Recipe and ingredient translation

### **Phase 3: Advanced Features (Q2 2025)**
- 🔄 **Regional Adaptations**: Cultural and regional adaptations
- 🔄 **Dynamic Translation**: Real-time translation capabilities
- 🔄 **Translation Management**: Translation workflow management
- 🔄 **Quality Assurance**: Translation quality validation
- 🔄 **Community Translation**: Community translation platform

### **Phase 4: Global Expansion (Q3 2025)**
- 🔄 **Asian Languages**: Japanese, Korean, Chinese support
- 🔄 **Regional Features**: Region-specific features and content
- 🔄 **Advanced Localization**: Advanced cultural adaptations
- 🔄 **Global Compliance**: Global compliance and regulations
- 🔄 **Performance Optimization**: Localization performance optimization

---

## 📞 Contact Information

For questions about localization and internationalization:

- **Development Team**: dev@hestia.com
- **Localization Team**: localization@hestia.com
- **Product Management**: product@hestia.com

---

*Document Version: 1.1.0*  
*Last Updated: December 28, 2024*  
*Status: Phase 1 - 90% Complete*
