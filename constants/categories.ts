export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  type: 'expense' | 'income' | 'both';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'restaurant', color: '#FF6B6B', bgColor: '#FFE8E8', type: 'expense' },
  { id: 'coffee', name: 'Coffee', icon: 'cafe', color: '#A0522D', bgColor: '#F5E6D3', type: 'expense' },
  { id: 'drink', name: 'Drinks', icon: 'wine', color: '#7C3AED', bgColor: '#EDE9FE', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'basket', color: '#059669', bgColor: '#D1FAE5', type: 'expense' },
  { id: 'restaurant', name: 'Restaurant', icon: 'fast-food', color: '#EA580C', bgColor: '#FFEDD5', type: 'expense' },
  { id: 'noodle', name: 'Noodle', icon: 'restaurant-outline', color: '#D97706', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'dessert', name: 'Dessert', icon: 'ice-cream', color: '#EC4899', bgColor: '#FCE7F3', type: 'expense' },
  { id: 'fruit', name: 'Fruit', icon: 'nutrition', color: '#16A34A', bgColor: '#DCFCE7', type: 'expense' },

  { id: 'transport', name: 'Transport', icon: 'car', color: '#2563EB', bgColor: '#DBEAFE', type: 'expense' },
  { id: 'bus', name: 'Bus', icon: 'bus', color: '#0891B2', bgColor: '#CFFAFE', type: 'expense' },
  { id: 'train', name: 'Train', icon: 'train', color: '#6366F1', bgColor: '#E0E7FF', type: 'expense' },
  { id: 'plane', name: 'Flight', icon: 'airplane', color: '#0EA5E9', bgColor: '#E0F2FE', type: 'expense' },
  { id: 'taxi', name: 'Taxi', icon: 'car-sport', color: '#EAB308', bgColor: '#FEF9C3', type: 'expense' },
  { id: 'fuel', name: 'Fuel', icon: 'flame', color: '#DC2626', bgColor: '#FEE2E2', type: 'expense' },

  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: '#DB2777', bgColor: '#FCE7F3', type: 'expense' },
  { id: 'clothes', name: 'Clothes', icon: 'shirt', color: '#9333EA', bgColor: '#F3E8FF', type: 'expense' },
  { id: 'shoes', name: 'Shoes', icon: 'footsteps', color: '#92400E', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'watch', name: 'Watch', icon: 'time', color: '#374151', bgColor: '#F3F4F6', type: 'expense' },
  { id: 'bag', name: 'Bag', icon: 'briefcase', color: '#78350F', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'cosmetic', name: 'Beauty', icon: 'sparkles', color: '#F43F5E', bgColor: '#FFE4E6', type: 'expense' },

  { id: 'housing', name: 'Housing', icon: 'home', color: '#0369A1', bgColor: '#E0F2FE', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: 'key', color: '#1D4ED8', bgColor: '#DBEAFE', type: 'expense' },
  { id: 'electricity', name: 'Electricity', icon: 'flash', color: '#CA8A04', bgColor: '#FEF9C3', type: 'expense' },
  { id: 'water', name: 'Water', icon: 'water', color: '#0891B2', bgColor: '#CFFAFE', type: 'expense' },
  { id: 'internet', name: 'Internet', icon: 'wifi', color: '#4F46E5', bgColor: '#E0E7FF', type: 'expense' },
  { id: 'phone', name: 'Phone', icon: 'phone-portrait', color: '#64748B', bgColor: '#F1F5F9', type: 'expense' },

  { id: 'health', name: 'Health', icon: 'medkit', color: '#16A34A', bgColor: '#DCFCE7', type: 'expense' },
  { id: 'medical', name: 'Medical', icon: 'fitness', color: '#DC2626', bgColor: '#FEE2E2', type: 'expense' },
  { id: 'pill', name: 'Medicine', icon: 'bandage', color: '#059669', bgColor: '#D1FAE5', type: 'expense' },
  { id: 'tooth', name: 'Dental', icon: 'happy', color: '#0D9488', bgColor: '#CCFBF1', type: 'expense' },
  { id: 'clean', name: 'Personal Care', icon: 'cut', color: '#7C3AED', bgColor: '#EDE9FE', type: 'expense' },
  { id: 'sport', name: 'Sport', icon: 'football', color: '#16A34A', bgColor: '#DCFCE7', type: 'expense' },
  { id: 'gym', name: 'Gym', icon: 'barbell', color: '#DC2626', bgColor: '#FEE2E2', type: 'expense' },

  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#7C3AED', bgColor: '#EDE9FE', type: 'expense' },
  { id: 'game', name: 'Games', icon: 'game-controller', color: '#6D28D9', bgColor: '#EDE9FE', type: 'expense' },
  { id: 'movie', name: 'Movies', icon: 'film', color: '#B45309', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'music', name: 'Music', icon: 'musical-notes', color: '#BE185D', bgColor: '#FCE7F3', type: 'expense' },
  { id: 'streaming', name: 'Streaming', icon: 'tv', color: '#DC2626', bgColor: '#FEE2E2', type: 'expense' },
  { id: 'books', name: 'Books', icon: 'book', color: '#92400E', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#1D4ED8', bgColor: '#DBEAFE', type: 'expense' },

  { id: 'travel', name: 'Travel', icon: 'earth', color: '#059669', bgColor: '#D1FAE5', type: 'expense' },
  { id: 'hotel', name: 'Hotel', icon: 'bed', color: '#0369A1', bgColor: '#E0F2FE', type: 'expense' },

  { id: 'gifts', name: 'Gifts', icon: 'gift', color: '#EC4899', bgColor: '#FCE7F3', type: 'expense' },
  { id: 'party', name: 'Party', icon: 'happy', color: '#F59E0B', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'pet', name: 'Pet', icon: 'paw', color: '#92400E', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'tools', name: 'Tools', icon: 'hammer', color: '#64748B', bgColor: '#F1F5F9', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'refresh-circle', color: '#6366F1', bgColor: '#E0E7FF', type: 'expense' },
  { id: 'taxes', name: 'Taxes', icon: 'document-text', color: '#374151', bgColor: '#F3F4F6', type: 'expense' },
  { id: 'insurance', name: 'Insurance', icon: 'shield-checkmark', color: '#0369A1', bgColor: '#E0F2FE', type: 'expense' },
  { id: 'other_expense', name: 'Other', icon: 'ellipsis-horizontal-circle', color: '#6B7280', bgColor: '#F3F4F6', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: '#059669', bgColor: '#D1FAE5', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#0891B2', bgColor: '#CFFAFE', type: 'income' },
  { id: 'business', name: 'Business', icon: 'storefront', color: '#0369A1', bgColor: '#E0F2FE', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#16A34A', bgColor: '#DCFCE7', type: 'income' },
  { id: 'rental', name: 'Rental', icon: 'home', color: '#2563EB', bgColor: '#DBEAFE', type: 'income' },
  { id: 'interest', name: 'Interest', icon: 'card', color: '#0D9488', bgColor: '#CCFBF1', type: 'income' },
  { id: 'bonus', name: 'Bonus', icon: 'trophy', color: '#D97706', bgColor: '#FEF3C7', type: 'income' },
  { id: 'cash', name: 'Cash', icon: 'cash', color: '#16A34A', bgColor: '#DCFCE7', type: 'income' },
  { id: 'gift_income', name: 'Gift Received', icon: 'gift', color: '#EC4899', bgColor: '#FCE7F3', type: 'income' },
  { id: 'refund', name: 'Refund', icon: 'return-down-back', color: '#6366F1', bgColor: '#E0E7FF', type: 'income' },
  { id: 'other_income', name: 'Other', icon: 'ellipsis-horizontal-circle', color: '#6B7280', bgColor: '#F3F4F6', type: 'income' },
];

export const SAVINGS_CATEGORIES: Category[] = [
  { id: 'emergency', name: 'Emergency Fund', icon: 'shield', color: '#DC2626', bgColor: '#FEE2E2', type: 'both' },
  { id: 'vacation', name: 'Vacation', icon: 'airplane', color: '#0EA5E9', bgColor: '#E0F2FE', type: 'both' },
  { id: 'retirement', name: 'Retirement', icon: 'hourglass', color: '#7C3AED', bgColor: '#EDE9FE', type: 'both' },
  { id: 'house', name: 'House', icon: 'home', color: '#0369A1', bgColor: '#E0F2FE', type: 'both' },
  { id: 'car_savings', name: 'Car', icon: 'car', color: '#2563EB', bgColor: '#DBEAFE', type: 'both' },
  { id: 'education_savings', name: 'Education', icon: 'school', color: '#1D4ED8', bgColor: '#DBEAFE', type: 'both' },
  { id: 'investment_savings', name: 'Investments', icon: 'trending-up', color: '#16A34A', bgColor: '#DCFCE7', type: 'both' },
  { id: 'other_savings', name: 'General', icon: 'wallet', color: '#45B7D1', bgColor: '#E0F9FF', type: 'both' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...SAVINGS_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find(c => c.id === id);
}

export function getCategoriesForType(type: 'expense' | 'income' | 'savings'): Category[] {
  if (type === 'savings') return SAVINGS_CATEGORIES;
  if (type === 'income') return INCOME_CATEGORIES;
  return EXPENSE_CATEGORIES;
}
