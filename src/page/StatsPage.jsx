import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Statistics from '../components/Stats';
import { deleteCategory, fetchCategories } from '../redux/actions/categoryActions';
import { get_transactions_action } from '../redux/actions/transactionActions';
import styles from '../styles/StatsPage.module.css';

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

  useEffect(() => {
    if (user?.id) {
      dispatch(get_transactions_action(user.id));
      dispatch(fetchCategories(user.id));
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
      dispatch(fetchCategories(user.id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (transactionsLoading || categoriesLoading) {
    return <div className={styles.loading}>Loading data...</div>;
  }

  if (transactionsError || categoriesError) {
    return <div className={styles.error}>
      Error: {transactionsError || categoriesError}
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