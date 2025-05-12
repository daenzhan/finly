import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Statistics from './Stats';
import { deleteCategory, fetchCategories } from '../redux/actions/categoryActions';
import { fetchTransactions } from '../redux/actions/transactionActions';

const StatsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { 
    data: transactions = [], 
    loading: transactionsLoading,
    error: transactionsError 
  } = useSelector((state) => state.transactions);
  
  const { 
    data: categories = [], 
    loading: categoriesLoading,
    error: categoriesError 
  } = useSelector((state) => state.categories);
  
  const dispatch = useDispatch();

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactions(user.id));
      dispatch(fetchCategories(user.id)); // Добавлена загрузка категорий
    }
  }, [dispatch, user?.id]);

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
      // После удаления перезагружаем категории
      dispatch(fetchCategories(user.id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (transactionsLoading || categoriesLoading) {
    return <div className="p-4">Загрузка данных...</div>;
  }

  if (transactionsError || categoriesError) {
    return <div className="p-4 text-red-500">
      Ошибка: {transactionsError || categoriesError}
    </div>;
  }

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