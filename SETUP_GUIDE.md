# Hestia Platform - MSW API Mock Server Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

First, install the required dependencies:

```bash
npm install msw @faker-js/faker --save-dev
```

### 2. Initialize MSW Service Worker

Run the MSW initialization command:

```bash
npm run msw:init
```

This will create the service worker file in the `public/` directory.

### 3. Start Development Server

Start your NestJS development server:

```bash
npm run start:dev
```

The MSW service worker will automatically start in development mode and intercept API requests.

## 📁 Project Structure

```
src/mocks/
├── handlers.ts          # Main API handlers with realistic mock data
├── browser.ts           # Browser setup for frontend development
├── node.ts              # Node.js setup for testing
├── types.ts             # TypeScript type definitions
├── test-setup.ts        # Test configuration
├── examples.ts          # Usage examples and API calls
├── index.ts             # Main exports and configuration
└── README.md            # Comprehensive documentation

public/
└── mockServiceWorker.js # MSW service worker (auto-generated)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Development Configuration
NODE_ENV=development
PORT=3000

# MSW Configuration
MSW_ENABLED=true
API_BASE_URL=http://localhost:3000/api
```

### Frontend Integration

If you're building a frontend application (React, Vue, etc.), add this to your main entry point:

```typescript
// src/main.ts (or index.ts)
if (process.env.NODE_ENV === 'development') {
  import('./mocks').then(({ startMSW }) => {
    startMSW()
      .then(() => {
        console.log('MSW started successfully for development');
      })
      .catch(error => {
        console.warn('MSW failed to start:', error);
      });
  });
}
```

## 🧪 Testing Setup

### Jest Configuration

The project includes a Jest configuration that automatically sets up MSW for testing:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/mocks/test-setup.ts'],
  // ... other config
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 📚 Available API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - User logout
- `POST /api/auth/password-reset` - Password reset

### User Management

- `GET /api/users` - Get users with pagination/filters
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/me/profile` - Current user profile

### Recipe Management

- `GET /api/recipes` - Get recipes with filters
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/search` - Search recipes
- `GET /api/recipes/collections` - Get collections

### Ingredient Management

- `GET /api/ingredients` - Get ingredients with filters
- `GET /api/ingredients/:id` - Get ingredient by ID
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `DELETE /api/ingredients/:id` - Delete ingredient
- `GET /api/ingredients/categories` - Get categories
- `GET /api/ingredients/:id/substitutions` - Get substitutions

### Item Management

- `GET /api/items` - Get items with filters
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/categories` - Get categories
- `POST /api/items/:id/maintenance` - Add maintenance record

### Analytics (Phase 2)

- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/recipes` - Recipe analytics
- `GET /api/analytics/ingredients` - Ingredient analytics

## 🎯 Usage Examples

### Basic API Call

```typescript
// Login example
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const loginData = await loginResponse.json();
console.log('Login successful:', loginData);
```

### Using the Examples Module

```typescript
import { authExamples, userExamples, recipeExamples } from './mocks/examples';

// User registration flow
const { registerResult, loginResult } = await usageExamples.userRegistrationFlow();

// Recipe creation flow
const recipeResult = await usageExamples.recipeCreationFlow();

// Analytics dashboard
const analytics = await usageExamples.getAnalyticsDashboard();
```

### Testing API Endpoints

```typescript
// Test user login
test('should handle user login', async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
  });

  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toHaveProperty('user');
  expect(data).toHaveProperty('tokens');
});
```

## 🔍 Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Search & Filtering

- `search`: Search term for text fields
- `role`: Filter by user role
- `status`: Filter by status
- `cuisine`: Filter recipes by cuisine
- `difficulty`: Filter by difficulty level
- `category`: Filter by category
- `dietaryType`: Filter ingredients by dietary type

### Examples

```typescript
// Get users with pagination and search
const users = await fetch('/api/users?page=1&limit=5&search=john&role=EDITOR');

// Get recipes with filters
const recipes = await fetch('/api/recipes?cuisine=Italian&difficulty=MEDIUM&status=PUBLISHED');

// Get ingredients by category
const ingredients = await fetch('/api/ingredients?category=Vegetables&dietaryType=vegan');
```

## 🛠️ Development Workflow

### 1. Start Development

```bash
npm run start:dev
```

### 2. Test API Endpoints

Use your browser's developer tools, Postman, or curl:

```bash
# Test user login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get users
curl http://localhost:3000/api/users?page=1&limit=5

# Get recipes
curl http://localhost:3000/api/recipes?cuisine=Italian
```

### 3. Switch to Real API

When ready to connect to your real NestJS backend:

```typescript
// Comment out or conditionally disable MSW
// if (process.env.NODE_ENV === 'development') {
//   import('./mocks').then(({ startMSW }) => startMSW());
// }
```

## 🔧 Customization

### Adding New Endpoints

1. Add new handlers to `src/mocks/handlers.ts`:

```typescript
rest.get('/api/new-endpoint', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      data: { message: 'New endpoint response' },
    }),
  );
});
```

2. Add corresponding types to `src/mocks/types.ts`
3. Update the README documentation

### Customizing Mock Data

Modify the data generators in `handlers.ts`:

```typescript
const generateUser = () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: 'VIEWER', // Customize default role
  // ... other fields
});
```

## 🚨 Troubleshooting

### Common Issues

1. **MSW not starting**: Check that `NODE_ENV=development`
2. **Service worker not found**: Run `npm run msw:init`
3. **CORS errors**: Ensure CORS is enabled in your NestJS app
4. **Type errors**: Install `@types/node` and `@types/jest`

### Debug Mode

Enable debug logging:

```typescript
// In your main.ts
if (process.env.NODE_ENV === 'development') {
  import('./mocks').then(({ startMSW }) => {
    startMSW()
      .then(() => {
        console.log('MSW started successfully');
      })
      .catch(error => {
        console.error('MSW failed to start:', error);
      });
  });
}
```

## 📞 Support

For issues with the MSW setup:

1. Check the [MSW documentation](https://mswjs.io/)
2. Review the handler implementations in `src/mocks/handlers.ts`
3. Check the TypeScript types in `src/mocks/types.ts`
4. Run tests to verify endpoint behavior

## 🎯 Next Steps

1. **Install Dependencies**: `npm install msw @faker-js/faker --save-dev`
2. **Initialize MSW**: `npm run msw:init`
3. **Start Development**: `npm run start:dev`
4. **Test Endpoints**: Use the examples in `src/mocks/examples.ts`
5. **Build Frontend**: Integrate with your frontend application
6. **Connect Real API**: Switch to your NestJS backend when ready

---

**Note**: This mock server is designed for development and testing only. Do not use in production environments.
