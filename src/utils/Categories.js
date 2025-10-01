// Common categories for entities
export const commonCategories = [
  'Uncategorized',
  'Auto Insurance',
  'Auto Loans / Lease',
  'Auto Repairs / Maintenance',
  'Debt Payments (Loans / Credit Interest)',
  'Dining / Restaurants',
  'Donations / Charity',
  'Entertainment / Gaming / Travel',
  'Financial (Taxes / Investments / Accounting)',
  'Gas / Fuel',
  'Groceries',
  'Healthcare / Medical / Dental / Vision',
  'HOA / Property Taxes',
  'Home Services',
  'Insurance (Non-Auto)',
  'Internal Transfers (Savings / Card Payoff)',
  'Mortgage / Rent',
  'Personal Care / Fitness',
  'Shopping / Retail',
  'Subscriptions / Memberships',
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