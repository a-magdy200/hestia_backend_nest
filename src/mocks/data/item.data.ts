/**
 * Mock item data for MSW
 * Provides realistic item management responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock item interface
 */
interface MockItem {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  currency: string;
  stockQuantity: number;
  unit: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  type: string;
  status: string;
  priority: string;
  barcode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate a single mock item
 * @returns A mock item object
 */
const generateMockItem = (): MockItem => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  category: faker.helpers.arrayElement(['Electronics', 'Clothing', 'Home', 'Sports', 'Books']),
  brand: faker.company.name(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
  currency: 'USD',
  stockQuantity: faker.number.int({ min: 0, max: 100 }),
  unit: faker.helpers.arrayElement(['piece', 'kg', 'liter', 'meter']),
  weight: faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 }),
  dimensions: {
    length: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
    width: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
    height: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
  },
  type: faker.helpers.arrayElement(['FOOD', 'SUPPLY', 'OTHER']),
  status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
  barcode: faker.string.alphanumeric(12),
  isActive: faker.datatype.boolean(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
});

/**
 * Mock item data
 */
export const mockItems: MockItem[] = Array.from({ length: 30 }, generateMockItem);

/**
 * Mock item management responses
 */
export const mockItemData = {
  getItems: {
    data: mockItems,
    pagination: {
      page: 1,
      limit: 10,
      total: mockItems.length,
      totalPages: Math.ceil(mockItems.length / 10),
      hasNext: mockItems.length > 10,
      hasPrev: false,
    },
  },

  getItemById: (id: string) => {
    const item = mockItems.find(i => i.id === id);
    return item || null;
  },

  createItemSuccess: {
    message: 'Item created successfully',
  },

  createItemFailure: {
    error: 'Item creation failed',
    message: 'Failed to create item',
  },

  updateItemSuccess: {
    message: 'Item updated successfully',
  },

  updateItemFailure: {
    error: 'Item not found',
    message: 'The specified item does not exist',
  },

  deleteItemSuccess: {
    message: 'Item deleted successfully',
  },

  deleteItemFailure: {
    error: 'Item not found',
    message: 'The specified item does not exist',
  },
};
