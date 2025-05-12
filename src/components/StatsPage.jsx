import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Statistics from './Stats';
import { deleteCategory } from '../redux/actions/categoryActions';

const StatsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: transactions = [] } = useSelector((state) => state.transactions);
  const { data: categories = [] } = useSelector((state) => state.categories);
  const dispatch = useDispatch();

  // Получаем символ валюты
  const getCurrencySymbol = () => {
    const currency = user?.currency || 'RUB';
    const symbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      KZT: '₸'
    };
    return symbols[currency] || currency;
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await dispatch(deleteCategory(categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <Statistics 
      incomesByCategory={categories.filter(c => c.type === 'income')}
      expensesByCategory={categories.filter(c => c.type === 'expense')}
      currencySymbol={getCurrencySymbol()}
      transactions={transactions}
      onDeleteCategory={handleDeleteCategory}
    />
  );
};

export default StatsPage;