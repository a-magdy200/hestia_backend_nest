# Hestia Enterprise SaaS Platform - API & Integration Handbook

## 📋 Document Information

| **Document Type** | API & Integration Handbook |
|-------------------|----------------------------|
| **Version** | 1.0.0 |
| **Last Updated** | December 28, 2024 |
| **Next Review** | January 28, 2025 |
| **Document Owner** | API Development Team |
| **Stakeholders** | Developers, Integration Partners, Third-Party Vendors |
| **Classification** | Technical Reference Document |

---

## 🎯 Executive Summary

This document provides comprehensive guidance for integrating with the Hestia Enterprise SaaS Platform through our RESTful APIs, GraphQL endpoints, and webhook system. It serves as the definitive reference for developers, integration partners, and third-party vendors.

### **Integration Capabilities**
- **RESTful APIs**: 47+ endpoints with comprehensive CRUD operations
- **GraphQL Support**: Flexible query language for complex data requirements
- **Webhook System**: Real-time event notifications and integrations
- **SDK Support**: Multi-language SDKs for rapid development
- **Developer Tools**: Interactive documentation, testing, and debugging

---

## 🔗 API Overview

### **Base URL Structure**
```
Production: https://api.hestia.com/v1
Staging:    https://api-staging.hestia.com/v1
Development: https://api-dev.hestia.com/v1
```

### **Authentication Methods**
- **JWT Bearer Token**: Primary authentication method
- **API Key**: For service-to-service integrations
- **OAuth 2.0**: For third-party application integrations
- **SSO Integration**: For enterprise customers

### **Response Format**
All API responses follow a consistent JSON structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-12-28T10:30:00Z",
  "requestId": "req_1234567890abcdef"
}
```

### **Error Handling**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  },
  "timestamp": "2024-12-28T10:30:00Z",
  "requestId": "req_1234567890abcdef"
}
```

---

## 🔐 Authentication & Authorization

### **JWT Authentication**

#### **Obtaining Access Token**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

#### **Using Access Token**
```http
GET /recipes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Token Refresh**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **API Key Authentication**

#### **Service-to-Service Integration**
```http
GET /recipes
X-API-Key: sk_live_1234567890abcdef
```

### **OAuth 2.0 Integration**

#### **Authorization Flow**
```http
GET /auth/oauth/authorize
?client_id=your_client_id
&redirect_uri=https://your-app.com/callback
&response_type=code
&scope=read:recipes write:recipes
&state=random_state_string
```

#### **Token Exchange**
```http
POST /auth/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=authorization_code
&redirect_uri=https://your-app.com/callback
&client_id=your_client_id
&client_secret=your_client_secret
```

---

## 📚 RESTful API Endpoints

### **User Management**

#### **User Registration**
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

#### **User Profile**
```http
GET /users/profile
Authorization: Bearer {token}

PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Passionate home chef",
  "preferences": {
    "cuisine": ["italian", "mediterranean"],
    "dietaryRestrictions": ["vegetarian"],
    "spiceLevel": "medium"
  }
}
```

#### **User Sessions**
```http
GET /users/sessions
Authorization: Bearer {token}

DELETE /users/sessions/{sessionId}
Authorization: Bearer {token}
```

### **Recipe Management**

#### **Recipe CRUD Operations**

**Create Recipe**
```http
POST /recipes
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Homemade Pizza Margherita",
  "description": "Classic Italian pizza with fresh mozzarella and basil",
  "instructions": "1. Prepare the dough...",
  "ingredients": [
    {
      "ingredientId": "ing_123",
      "quantity": 2,
      "unit": "cups",
      "notes": "All-purpose flour"
    }
  ],
  "cookingTime": 30,
  "prepTime": 45,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "italian",
  "tags": ["pizza", "italian", "vegetarian"]
}
```

**Get Recipe**
```http
GET /recipes/{recipeId}
Authorization: Bearer {token}
```

**Update Recipe**
```http
PUT /recipes/{recipeId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Pizza Margherita",
  "description": "Updated description"
}
```

**Delete Recipe**
```http
DELETE /recipes/{recipeId}
Authorization: Bearer {token}
```

#### **Recipe Search & Discovery**

**Search Recipes**
```http
GET /recipes/search
?q=pizza
&cuisine=italian
&difficulty=medium
&maxCookingTime=60
&servings=4
&tags=vegetarian
&page=1
&limit=20
&sort=relevance
```

**Get Popular Recipes**
```http
GET /recipes/popular
?timeframe=week
&limit=10
&cuisine=italian
```

**Get Trending Recipes**
```http
GET /recipes/trending
?limit=10
&category=main-course
```

#### **Recipe Interactions**

**Rate Recipe**
```http
POST /recipes/{recipeId}/ratings
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent recipe! Very easy to follow."
}
```

**Favorite Recipe**
```http
POST /recipes/{recipeId}/favorites
Authorization: Bearer {token}

DELETE /recipes/{recipeId}/favorites
Authorization: Bearer {token}
```

**Share Recipe**
```http
POST /recipes/{recipeId}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "platform": "facebook",
  "message": "Check out this amazing recipe!"
}
```

### **Ingredient Management**

#### **Ingredient CRUD Operations**

**Get Ingredients**
```http
GET /ingredients
?search=tomato
&category=vegetables
&allergens=gluten-free
&page=1
&limit=20
```

**Get Ingredient Details**
```http
GET /ingredients/{ingredientId}
```

**Create Custom Ingredient**
```http
POST /ingredients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Custom Spice Blend",
  "description": "My special spice mixture",
  "categoryId": "cat_123",
  "nutritionalInfo": {
    "calories": 5,
    "protein": 0.2,
    "carbs": 1.0,
    "fat": 0.1
  },
  "allergens": [],
  "dietaryTypes": ["vegan", "gluten-free"]
}
```

#### **Ingredient Search & Discovery**

**Search Ingredients**
```http
GET /ingredients/search
?q=tomato
&category=vegetables
&seasonal=true
&origin=local
&page=1
&limit=20
```

**Get Ingredient Substitutions**
```http
GET /ingredients/{ingredientId}/substitutions
```

### **Item Management**

#### **Item CRUD Operations**

**Create Item**
```http
POST /items
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "KitchenAid Stand Mixer",
  "description": "Professional stand mixer for baking",
  "categoryId": "cat_456",
  "type": "electronics",
  "status": "active",
  "priority": "high",
  "brand": "KitchenAid",
  "model": "KSM150PS",
  "serialNumber": "KA123456789",
  "purchaseDate": "2023-01-15",
  "purchasePrice": 299.99
}
```

**Get Items**
```http
GET /items
Authorization: Bearer {token}
?category=kitchen
&status=active
&priority=high
&page=1
&limit=20
```

**Update Item**
```http
PUT /items/{itemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "maintenance",
  "notes": "Needs cleaning and calibration"
}
```

### **Collections & Organization**

#### **Recipe Collections**

**Create Collection**
```http
POST /collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Italian Favorites",
  "description": "My favorite Italian recipes",
  "isPublic": true,
  "tags": ["italian", "favorites"]
}
```

**Add Recipe to Collection**
```http
POST /collections/{collectionId}/recipes
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipeId": "recipe_123"
}
```

**Get Collection Recipes**
```http
GET /collections/{collectionId}/recipes
?page=1
&limit=20
```

### **Analytics & Reporting**

#### **User Analytics**

**Get User Statistics**
```http
GET /analytics/user
Authorization: Bearer {token}
?timeframe=month
&metrics=recipes_created,recipes_viewed,time_spent
```

**Get Recipe Analytics**
```http
GET /analytics/recipes/{recipeId}
Authorization: Bearer {token}
?timeframe=week
```

#### **Business Intelligence**

**Get Platform Analytics**
```http
GET /analytics/platform
Authorization: Bearer {token}
?timeframe=month
&metrics=active_users,recipes_created,engagement_rate
```

---

## 🔍 GraphQL API

### **GraphQL Endpoint**
```
Production: https://api.hestia.com/graphql
Staging:    https://api-staging.hestia.com/graphql
```

### **Schema Introspection**
```graphql
query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      ...FullType
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
}
```

### **Recipe Queries**

**Get Recipe with Details**
```graphql
query GetRecipe($id: ID!) {
  recipe(id: $id) {
    id
    title
    description
    instructions
    cookingTime
    prepTime
    servings
    difficulty
    cuisine
    tags
    imageUrl
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
    }
    ingredients {
      id
      name
      quantity
      unit
      notes
    }
    ratings {
      id
      rating
      review
      user {
        firstName
        lastName
      }
      createdAt
    }
    nutrition {
      calories
      protein
      carbs
      fat
      fiber
    }
  }
}
```

**Search Recipes with Filters**
```graphql
query SearchRecipes(
  $query: String
  $cuisine: String
  $difficulty: Difficulty
  $maxCookingTime: Int
  $servings: Int
  $tags: [String!]
  $first: Int
  $after: String
) {
  searchRecipes(
    query: $query
    cuisine: $cuisine
    difficulty: $difficulty
    maxCookingTime: $maxCookingTime
    servings: $servings
    tags: $tags
    first: $first
    after: $after
  ) {
    edges {
      node {
        id
        title
        description
        imageUrl
        cookingTime
        difficulty
        cuisine
        rating
        ratingCount
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### **Real-time Subscriptions**

**Recipe Updates**
```graphql
subscription RecipeUpdates($recipeId: ID!) {
  recipeUpdated(recipeId: $recipeId) {
    id
    title
    description
    updatedAt
    version
  }
}
```

**User Activity**
```graphql
subscription UserActivity {
  userActivity {
    type
    recipeId
    userId
    timestamp
    data
  }
}
```

---

## 🔔 Webhook System

### **Webhook Configuration**

#### **Register Webhook**
```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/hestia",
  "events": ["recipe.created", "recipe.updated", "user.registered"],
  "description": "Recipe management webhook",
  "secret": "your_webhook_secret"
}
```

#### **Webhook Events**
```json
{
  "id": "evt_1234567890",
  "type": "recipe.created",
  "data": {
    "recipe": {
      "id": "recipe_123",
      "title": "Homemade Pizza",
      "userId": "user_456"
    }
  },
  "created": 1640995200,
  "livemode": true
}
```

#### **Webhook Verification**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### **Supported Events**

| **Event** | **Description** | **Data Payload** |
|-----------|-----------------|------------------|
| `user.registered` | New user registration | User object |
| `user.updated` | User profile update | User object |
| `recipe.created` | New recipe creation | Recipe object |
| `recipe.updated` | Recipe modification | Recipe object |
| `recipe.deleted` | Recipe deletion | Recipe ID |
| `recipe.rated` | Recipe rating/review | Rating object |
| `recipe.favorited` | Recipe favorited | Recipe and User IDs |
| `ingredient.created` | New ingredient | Ingredient object |
| `collection.created` | New collection | Collection object |
| `item.created` | New item | Item object |
| `item.updated` | Item modification | Item object |

---

## 🛠️ SDKs & Developer Tools

### **JavaScript/TypeScript SDK**

#### **Installation**
```bash
npm install @hestia/sdk
```

#### **Basic Usage**
```javascript
import { HestiaClient } from '@hestia/sdk';

const client = new HestiaClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create a recipe
const recipe = await client.recipes.create({
  title: 'Homemade Pizza',
  description: 'Delicious pizza recipe',
  instructions: '1. Prepare dough...',
  ingredients: [
    { name: 'Flour', quantity: 2, unit: 'cups' }
  ]
});

// Search recipes
const searchResults = await client.recipes.search({
  query: 'pizza',
  cuisine: 'italian',
  limit: 10
});

// Get user profile
const profile = await client.users.getProfile();
```

#### **Advanced Features**
```javascript
// Real-time subscriptions
const subscription = client.subscriptions.recipeUpdates('recipe_123', {
  onUpdate: (recipe) => {
    console.log('Recipe updated:', recipe);
  }
});

// Batch operations
const batchResults = await client.recipes.batchCreate([
  recipe1,
  recipe2,
  recipe3
]);

// File upload
const imageUrl = await client.files.upload(file, {
  type: 'recipe-image',
  recipeId: 'recipe_123'
});
```

### **Python SDK**

#### **Installation**
```bash
pip install hestia-sdk
```

#### **Usage**
```python
from hestia import HestiaClient

client = HestiaClient(api_key='your_api_key')

# Create recipe
recipe = client.recipes.create({
    'title': 'Homemade Pizza',
    'description': 'Delicious pizza recipe',
    'instructions': '1. Prepare dough...',
    'ingredients': [
        {'name': 'Flour', 'quantity': 2, 'unit': 'cups'}
    ]
})

# Search recipes
results = client.recipes.search(
    query='pizza',
    cuisine='italian',
    limit=10
)
```

### **PHP SDK**

#### **Installation**
```bash
composer require hestia/php-sdk
```

#### **Usage**
```php
use Hestia\HestiaClient;

$client = new HestiaClient('your_api_key');

// Create recipe
$recipe = $client->recipes->create([
    'title' => 'Homemade Pizza',
    'description' => 'Delicious pizza recipe',
    'instructions' => '1. Prepare dough...',
    'ingredients' => [
        ['name' => 'Flour', 'quantity' => 2, 'unit' => 'cups']
    ]
]);

// Search recipes
$results = $client->recipes->search([
    'query' => 'pizza',
    'cuisine' => 'italian',
    'limit' => 10
]);
```

---

## 📊 Rate Limiting & Quotas

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Tiers**

| **Tier** | **Requests/Hour** | **Requests/Day** | **Concurrent Requests** |
|----------|-------------------|------------------|-------------------------|
| Free | 100 | 1,000 | 5 |
| Basic | 1,000 | 10,000 | 20 |
| Professional | 10,000 | 100,000 | 50 |
| Enterprise | 100,000 | 1,000,000 | 200 |

### **Handling Rate Limits**
```javascript
try {
  const response = await client.recipes.search({ query: 'pizza' });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    const resetTime = error.headers['x-ratelimit-reset'];
    const waitTime = (resetTime * 1000) - Date.now();
    
    // Wait and retry
    setTimeout(() => {
      // Retry request
    }, waitTime);
  }
}
```

---

## 🔒 Security Best Practices

### **API Key Security**
- Store API keys securely (environment variables, secret management)
- Rotate API keys regularly
- Use different keys for different environments
- Never commit API keys to version control

### **Request Security**
```javascript
// Always use HTTPS
const client = new HestiaClient({
  apiKey: process.env.HESTIA_API_KEY,
  baseURL: 'https://api.hestia.com'
});

// Validate input data
const recipe = await client.recipes.create({
  title: sanitizeInput(recipeData.title),
  description: sanitizeInput(recipeData.description)
});
```

### **Webhook Security**
```javascript
// Verify webhook signatures
app.post('/webhooks/hestia', (req, res) => {
  const signature = req.headers['x-hestia-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  handleWebhook(req.body);
  res.status(200).json({ received: true });
});
```

---

## 🧪 Testing & Development

### **API Testing Tools**

#### **Postman Collection**
```json
{
  "info": {
    "name": "Hestia API",
    "description": "Complete API collection for Hestia platform"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password\"}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

#### **cURL Examples**
```bash
# Login
curl -X POST https://api.hestia.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get recipes
curl -X GET https://api.hestia.com/v1/recipes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create recipe
curl -X POST https://api.hestia.com/v1/recipes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Recipe","instructions":"Test instructions"}'
```

### **Mock Server**
```javascript
// Mock server for development
const mockServer = {
  recipes: {
    create: (data) => Promise.resolve({
      id: 'mock_recipe_123',
      ...data,
      createdAt: new Date().toISOString()
    }),
    search: (params) => Promise.resolve({
      data: [],
      pagination: { page: 1, limit: 20, total: 0 }
    })
  }
};
```

---

## 📈 Monitoring & Analytics

### **API Analytics Dashboard**
```javascript
// Track API usage
const analytics = {
  trackRequest: (endpoint, method, duration, status) => {
    // Send to analytics service
    analyticsService.track('api_request', {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    });
  }
};
```

### **Error Tracking**
```javascript
// Comprehensive error handling
try {
  const response = await client.recipes.create(recipeData);
} catch (error) {
  // Log error details
  errorTracker.captureException(error, {
    extra: {
      endpoint: '/recipes',
      method: 'POST',
      data: recipeData
    }
  });
  
  // Handle specific error types
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Handle validation errors
      break;
    case 'RATE_LIMIT_EXCEEDED':
      // Handle rate limiting
      break;
    default:
      // Handle other errors
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

---

*Document Version: 1.0.0*  
*Last Updated: December 28, 2024*  
*Status: Technical Reference Document*  
*Next Review: January 28, 2025* 