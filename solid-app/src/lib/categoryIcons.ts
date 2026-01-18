import {
  FiShoppingCart,
  FiCoffee,
  FiTruck,
  FiFilm,
  FiHome,
  FiHeart,
  FiBook,
  FiMapPin,
  FiMoreHorizontal,
} from 'solid-icons/fi';

export const categoryIcons: Record<string, any> = {
  'Food & Dining': FiCoffee,
  'Transportation': FiTruck,
  'Shopping': FiShoppingCart,
  'Entertainment': FiFilm,
  'Bills & Utilities': FiHome,
  'Healthcare': FiHeart,
  'Education': FiBook,
  'Travel': FiMapPin,
  'Other': FiMoreHorizontal,
};

export const getCategoryIcon = (category: string) => {
  return categoryIcons[category] || FiMoreHorizontal;
};

export const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-500',
  'Transportation': 'bg-blue-500',
  'Shopping': 'bg-purple-500',
  'Entertainment': 'bg-pink-500',
  'Bills & Utilities': 'bg-green-500',
  'Healthcare': 'bg-red-500',
  'Education': 'bg-indigo-500',
  'Travel': 'bg-teal-500',
  'Other': 'bg-gray-500',
};

export const getCategoryColor = (category: string) => {
  return categoryColors[category] || 'bg-gray-500';
};
