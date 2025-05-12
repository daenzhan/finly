// src/constants/categoryConstants.js
export const defaultIncomeCategories = [
  { id: 'default_salary', name: 'Salary', icon: '💼', color: '#4CAF50', type: 'income' },
  { id: 'default_scholarship', name: 'Scholarship', icon: '🎓', color: '#8BC34A', type: 'income' },
  { id: 'default_pension', name: 'Pension', icon: '👵', color: '#CDDC39', type: 'income' },
  { id: 'default_other_income', name: 'Other', icon: '💰', color: '#FFC107', type: 'income' }
];

export const defaultExpenseCategories = [
  { id: 'default_transport', name: 'Transport', icon: '🚕', color: '#F44336', type: 'expense' },
  { id: 'default_products', name: 'Food', icon: '🍎', color: '#E91E63', type: 'expense' },
  { id: 'default_shopping', name: 'Shopping', icon: '🛍️', color: '#9C27B0', type: 'expense' },
  { id: 'default_entertainment', name: 'Entertainment', icon: '🎬', color: '#673AB7', type: 'expense' },
  { id: 'default_other_expense', name: 'Other', icon: '💸', color: '#3F51B5', type: 'expense' }
];

export const EMOJI_GROUPS = {
  'Food': ['🍎', '🍔', '🍕', '🍟', '🌮', '🍣', '🍜', '🍦', '☕', '🍺'],
  'Transport': ['🚗', '🚕', '🚲', '✈️', '🚆', '🚢', '🛵', '🚀'],
  'Finance': ['💰', '💵', '💳', '🏦', '📈', '💲'],
  'Entertainment': ['🎬', '🎮', '🎧', '🎤', '🎭', '🎲'],
  'Shopping': ['🛍️', '👕', '👠', '🛒', '🎁'],
  'Health': ['💊', '🏥', '🚑', '🩺', '💉'],
  'Education': ['📚', '🎓', '✏️', '📝', '🏫'],
  'Home': ['🏠', '🛋️', '🛏️', '🚿', '🍳'],
  'Other': ['❤️', '⭐', '🎯', '🔑', '⏰']
};