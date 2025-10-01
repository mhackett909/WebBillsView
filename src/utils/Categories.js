// Common categories for entities
export const commonCategories = [
  'Uncategorized',
  'Auto Insurance',
  'Auto Loan',
  'Auto Repairs',
  'Debt Payments',
  'Dining',
  'Donations',
  'Entertainment',
  'Financial',
  'Friends / Family',
  'Fuel',
  'Groceries',
  'Healthcare',
  'HOA / Taxes',
  'Home Services',
  'Insurance',
  'Mortgage / Rent',
  'Personal Care / Fitness',
  'Shopping',
  'Subscriptions',
  'Utilities'
];


/**
 * Finds a category by name, ignoring case differences
 * @param {string} categoryName - The category name to find
 * @returns {string} - The properly formatted category name or 'Uncategorized' if not found
 */
export function findCategoryByName(categoryName) {
  if (!categoryName) return 'Uncategorized';
  
  const normalized = categoryName.toLowerCase().trim();
  const found = commonCategories.find(cat => cat.toLowerCase() === normalized);
  return found || 'Uncategorized';
}

/**
 * Gets the default category
 * @returns {string} - The default category name
 */
export function getDefaultCategory() {
  return 'Uncategorized';
}