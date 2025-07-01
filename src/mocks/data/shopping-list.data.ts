/**
 * Mock shopping list data for MSW
 * Provides realistic shopping list management responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock shopping list item interface
 */
interface MockShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  status: string;
  estimatedCost: number;
  actualCost: number | null;
  notes: string[];
  substitutions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Mock shopping list interface
 */
interface MockShoppingList {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: string;
  items: MockShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate a single mock shopping list
 * @returns A mock shopping list object
 */
const generateMockShoppingList = (): MockShoppingList => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  name: `${faker.commerce.productName()} List`,
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['ACTIVE', 'COMPLETED', 'ARCHIVED']),
  items: [], // Will be filled below
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
});

/**
 * Generate a single mock shopping list item
 * @param shoppingListId The ID of the shopping list this item belongs to
 * @returns A mock shopping list item object
 */
const generateMockShoppingListItem = (shoppingListId: string): MockShoppingListItem => ({
  id: faker.string.uuid(),
  shoppingListId,
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  quantity: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
  unit: faker.helpers.arrayElement(['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'piece']),
  status: faker.helpers.arrayElement(['PENDING', 'PURCHASED', 'REMOVED']),
  estimatedCost: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  actualCost: faker.datatype.boolean()
    ? faker.number.float({ min: 1, max: 100, fractionDigits: 2 })
    : null,
  notes: faker.datatype.boolean() ? [faker.lorem.sentence()] : [],
  substitutions: faker.datatype.boolean() ? [faker.commerce.productName()] : [],
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
});

/**
 * Mock shopping list data
 */
export const mockShoppingLists: MockShoppingList[] = Array.from(
  { length: 10 },
  generateMockShoppingList,
);

export const mockShoppingListItems: MockShoppingListItem[] = mockShoppingLists.flatMap(list =>
  Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () =>
    generateMockShoppingListItem(list.id),
  ),
);

// Assign items to lists
mockShoppingLists.forEach(list => {
  list.items = mockShoppingListItems.filter(item => item.shoppingListId === list.id);
});

/**
 * Mock shopping list management responses
 */
export const mockShoppingListData = {
  getShoppingLists: {
    data: mockShoppingLists,
    pagination: {
      page: 1,
      limit: 10,
      total: mockShoppingLists.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },

  getShoppingListById: (id: string) => {
    const list = mockShoppingLists.find(l => l.id === id);
    return list || null;
  },

  getShoppingListItems: (shoppingListId: string) => {
    return mockShoppingListItems.filter(item => item.shoppingListId === shoppingListId);
  },

  createShoppingListSuccess: {
    message: 'Shopping list created successfully',
  },

  createShoppingListFailure: {
    error: 'Shopping list creation failed',
    message: 'Failed to create shopping list',
  },

  updateShoppingListSuccess: {
    message: 'Shopping list updated successfully',
  },

  updateShoppingListFailure: {
    error: 'Shopping list not found',
    message: 'The specified shopping list does not exist',
  },

  deleteShoppingListSuccess: {
    message: 'Shopping list deleted successfully',
  },

  deleteShoppingListFailure: {
    error: 'Shopping list not found',
    message: 'The specified shopping list does not exist',
  },

  addItemSuccess: {
    message: 'Item added to shopping list successfully',
  },

  addItemFailure: {
    error: 'Add item failed',
    message: 'Failed to add item to shopping list',
  },

  updateItemSuccess: {
    message: 'Shopping list item updated successfully',
  },

  updateItemFailure: {
    error: 'Item not found',
    message: 'The specified item does not exist',
  },

  deleteItemSuccess: {
    message: 'Shopping list item deleted successfully',
  },

  deleteItemFailure: {
    error: 'Item not found',
    message: 'The specified item does not exist',
  },
};
