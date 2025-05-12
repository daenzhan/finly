import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Money } from '../utils';
import { fetchAccounts, addAccount } from '../redux/actions/accountActions';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from '../redux/actions/transactionActions';
import { fetchCategories } from '../redux/actions/categoryActions';
import { toast } from 'react-toastify';
import LogoutButton from '../components/LogoutButton';
import styles from '../styles/Dashboard.module.css';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KZT: '₸',
};

const defaultIncomeCategories = [
  { id: 'default_salary', name: 'Зарплата', icon: '💼', color: '#4CAF50', type: 'income' },
  { id: 'default_scholarship', name: 'Стипендия', icon: '🎓', color: '#8BC34A', type: 'income' },
  { id: 'default_pension', name: 'Пенсия', icon: '👵', color: '#CDDC39', type: 'income' },
  { id: 'default_other_income', name: 'Другое', icon: '💰', color: '#FFC107', type: 'income' }
];

const defaultExpenseCategories = [
  { id: 'default_transport', name: 'Транспорт', icon: '🚕', color: '#F44336', type: 'expense' },
  { id: 'default_products', name: 'Продукты', icon: '🍎', color: '#E91E63', type: 'expense' },
  { id: 'default_shopping', name: 'Покупки', icon: '🛍️', color: '#9C27B0', type: 'expense' },
  { id: 'default_entertainment', name: 'Развлечения', icon: '🎬', color: '#673AB7', type: 'expense' },
  { id: 'default_other_expense', name: 'Другое', icon: '💸', color: '#3F51B5', type: 'expense' }
];

export default function Dashboard() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [newAccount, setNewAccount] = useState({
    name: '',
    icon: 'wallet',
    balance: 0,
    currency: 'RUB'
  });

  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const {
    data: accounts,
    loading: accountsLoading,
    error: accountsError
  } = useSelector((state) => state.accounts);
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError
  } = useSelector((state) => state.transactions);
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useSelector((state) => state.categories);

  const loading = accountsLoading || transactionsLoading || categoriesLoading;
  const error = accountsError || transactionsError || categoriesError;

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAccounts(user.id));
      dispatch(fetchTransactions(user.id));
      dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user?.id]);

  const userIncomeCategories = categories?.filter(cat => cat.type === 'income') || [];
  const userExpenseCategories = categories?.filter(cat => cat.type === 'expense') || [];

  const incomeCategories = [...defaultIncomeCategories, ...userIncomeCategories];
  const expenseCategories = [...defaultExpenseCategories, ...userExpenseCategories];

  const filteredTransactions = transactions?.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= new Date(dateRange.start) && txDate <= new Date(dateRange.end);
  }) || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      accountId: '',
      categoryId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      comment: ''
    });
    setTransactionType('income');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }

    const selectedCategory = [
      ...defaultIncomeCategories,
      ...defaultExpenseCategories,
      ...userIncomeCategories,
      ...userExpenseCategories
    ].find(c => c.id === formData.categoryId);

    if (!selectedCategory) {
      toast.error('Выберите категорию');
      return;
    }

    const newTransaction = {
      userId: user.id,
      accountId: formData.accountId,
      amount: transactionType === 'income' ? amount : -amount,
      date: formData.date,
      comment: formData.comment,
      type: transactionType,
      createdAt: new Date().toISOString(),
      category: selectedCategory.name,
      categoryId: selectedCategory.id
    };

    try {
      await dispatch(addTransaction(newTransaction));
      setShowModal(false);
      resetForm();
      toast.success('Транзакция успешно добавлена');
    } catch (error) {
      toast.error('Не удалось добавить транзакцию');
    }
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setTransactionType(tx.type);
    setFormData({
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      amount: Math.abs(tx.amount).toString(),
      date: tx.date.split('T')[0],
      comment: tx.comment || ''
    });
    setShowModal(true);
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }
  
    const updatedTransaction = {
      id: editingTransaction.id,
      userId: editingTransaction.userId,
      accountId: formData.accountId,
      categoryId: formData.categoryId,
      amount: transactionType === 'income' ? amount : -amount,
      date: formData.date,
      comment: formData.comment,
      type: transactionType,
      createdAt: editingTransaction.createdAt
    };
  
    try {
      await dispatch(updateTransaction(updatedTransaction));
      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      toast.success('Транзакция обновлена');
    } catch (error) {
      toast.error('Не удалось обновить транзакцию');
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      try {
        await dispatch(deleteTransaction(txId));
        toast.success('Транзакция удалена');
      } catch (error) {
        toast.error(error.message || 'Не удалось удалить транзакцию');
      }
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addAccount({
        ...newAccount,
        userId: user.id,
        createdAt: new Date().toISOString()
      }));
      setShowAccountModal(false);
      setNewAccount({
        name: '',
        icon: 'wallet',
        balance: 0,
        currency: user?.currency || 'RUB'
      });
      toast.success('Счет успешно добавлен');
    } catch (error) {
      console.error("Ошибка при создании счета:", error);
      toast.error(error.response?.data?.message || 'Не удалось добавить счет');
    }
  };

  const calculateTransactions = () => {
    if (!filteredTransactions || !Array.isArray(filteredTransactions)) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        incomesByCategory: [],
        expensesByCategory: []
      };
    }
  
    const allCategories = [
      ...defaultIncomeCategories,
      ...defaultExpenseCategories,
      ...userIncomeCategories,
      ...userExpenseCategories
    ];
  
    const groupByCategory = (transactions, type) => {
      const result = {};
      
      allCategories
        .filter(c => c.type === type)
        .forEach(cat => {
          result[cat.id] = {
            ...cat,
            total: 0
          };
        });
  
      transactions.forEach(tx => {
        const categoryId = tx.categoryId;
        if (result[categoryId]) {
          result[categoryId].total += Math.abs(tx.amount);
        }
      });
  
      return Object.values(result).filter(c => c.total > 0);
    };
  
    const incomeTransactions = filteredTransactions.filter(tx => tx.type === 'income');
    const expenseTransactions = filteredTransactions.filter(tx => tx.type === 'expense');
  
    return { 
      totalIncome: incomeTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      totalExpense: expenseTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      incomesByCategory: groupByCategory(incomeTransactions, 'income'),
      expensesByCategory: groupByCategory(expenseTransactions, 'expense')
    };
  };

  const { totalIncome, totalExpense } = calculateTransactions();
  const balance = totalIncome - totalExpense;

  const getCurrencySymbol = (currency = user?.currency) => {
    return currencySymbols[currency] || currency;
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
  
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!user) return <div className={styles.error}>Пользователь не авторизован</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeTitle}>
        Добро пожаловать в Finly, {user.name || user.email}!
      </h1>

      <div className={styles.linksContainer}>
        <Link 
          to="/stats" 
          className={`${styles.link} ${styles.linkPrimary}`}
        >
          <i className="fas fa-chart-bar"></i> Перейти к статистике
        </Link>
        <Link 
          to="/categories" 
          className={`${styles.link} ${styles.linkSecondary}`}
        >
          <i className="fas fa-tags"></i> Управление категориями
        </Link>
      </div>
      
      {/* Общий баланс */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceHeader}>
          <h2 className={styles.balanceTitle}>Общий баланс</h2>
          <div className={`${styles.balanceAmount} ${balance >= 0 ? styles.positive : styles.negative}`}>
            {Money.format(balance)} {getCurrencySymbol()}
          </div>
        </div>
        <div className={styles.balanceSummary}>
          <div className={styles.income}>
            Доходы: +{Money.format(totalIncome)} {getCurrencySymbol()}
          </div>
          <div className={styles.expense}>
            Расходы: -{Money.format(totalExpense)} {getCurrencySymbol()}
          </div>
        </div>
      </div>
      
      {/* Фильтр по дате */}
      <div className={styles.dateFilter}>
        <div className={styles.dateGroup}>
          <label className={styles.dateLabel}>С:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className={styles.dateInput}
          />
        </div>
        <div className={styles.dateGroup}>
          <label className={styles.dateLabel}>По:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* Блок счетов */}
      <div className={styles.accountsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ваши счета</h2>
          <span className={styles.sectionSubtitle}>
            Общий баланс: {Money.format(
              accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
            )} {getCurrencySymbol()}
          </span>
        </div>
        <div className={styles.accountsGrid}>
          {accounts.map((acc) => (
            <div key={acc.id} className={styles.accountCard}>
              <div className={styles.accountContent}>
                <span className={styles.accountName}>{acc.name}</span>
                <span className={acc.balance >= 0 ? styles.positive : styles.negative}>
                  {Money.format(acc.balance)} {getCurrencySymbol(acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* История транзакций */}
      <div className={styles.transactionsSection}>
        <h2 className={styles.sectionTitle}>История транзакций</h2>
        {filteredTransactions.length === 0 ? (
          <p className={styles.emptyState}>Нет транзакций за выбранный период</p>
        ) : (
          <div className={styles.transactionsList}>
            {filteredTransactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(tx => {
                const category = [...incomeCategories, ...expenseCategories]
                  .find(cat => cat.id === tx.categoryId);
                const account = accounts.find(acc => acc.id === tx.accountId);
                
                return (
                  <div 
                    key={tx.id} 
                    className={styles.transactionCard}
                  >
                    <div className={styles.transactionInfo}>
                      <span 
                        className={styles.transactionIcon}
                        style={{ color: category?.color }}
                      >
                        {category?.icon || '💸'}
                      </span>
                      <div className={styles.transactionDetails}>
                        <div className={styles.transactionCategory}>{category?.name || 'Неизвестно'}</div>
                        <div className={styles.transactionMeta}>
                          {account?.name} • {new Date(tx.date).toLocaleDateString()}
                          {tx.comment && ` • "${tx.comment}"`}
                        </div>
                      </div>
                    </div>
                    <div className={styles.transactionAmountWrapper}>
                      <div className={`${styles.transactionAmount} ${
                        tx.type === 'income' ? styles.positive : styles.negative
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {Money.format(Math.abs(tx.amount))} {getCurrencySymbol()}
                      </div>
                      <div className={styles.transactionActions}>
                        <button 
                          onClick={() => handleEditTransaction(tx)}
                          className={styles.actionButton}
                          title="Редактировать"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Удалить транзакцию"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Кнопка добавления транзакции */}
      <button 
        onClick={() => setShowModal(true)}
        className={styles.addButton}
        title="Добавить транзакцию"
      >
        <i className="fas fa-plus"></i>
      </button>

      {/* Кнопка добавления счета */}
      <button 
        onClick={() => setShowAccountModal(true)}
        className={`${styles.addButton} ${styles.addAccountButton}`}
        title="Добавить счет"
      >
        <i className="fas fa-wallet"></i>
      </button>
      
      {/* Модальное окно для добавления/редактирования транзакции */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingTransaction ? 'Редактировать транзакцию' : 'Добавить транзакцию'}
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={editingTransaction ? handleUpdateTransaction : handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Тип транзакции:</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      transactionType === 'income' ? styles.toggleButtonActive : ''
                    }`}
                    onClick={() => setTransactionType('income')}
                  >
                    <i className="fas fa-arrow-down"></i> Доход
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      transactionType === 'expense' ? styles.toggleButtonActive : ''
                    }`}
                    onClick={() => setTransactionType('expense')}
                  >
                    <i className="fas fa-arrow-up"></i> Расход
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Счет:</label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${styles.selectControl}`}
                  required
                >
                  <option value="">Выберите счет</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Категория:</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${styles.selectControl}`}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {transactionType === 'income' ? (
                    incomeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))
                  ) : (
                    expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Сумма:     <i className={`${styles.inputIcon} fas fa-${getCurrencySymbol().replace('₽', 'ruble-sign').replace('$', 'dollar-sign').replace('€', 'euro-sign').replace('₸', 'tenge')}`}></i></label>
                <div className={styles.inputWithIcon}>
              
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Дата:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Комментарий:</label>
                <input
                  type="text"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="Необязательно"
                />
              </div>

              <div className={styles.buttonsGroup}>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  <i className="fas fa-check"></i> {editingTransaction ? 'Обновить' : 'Добавить'}
                </button>
                {editingTransaction && (
                  <button
                    type="button"
                    className={`${styles.submitButton} ${styles.dangerButton}`}
                    onClick={() => handleDeleteTransaction(editingTransaction.id)}
                  >
                    <i className="fas fa-trash-alt"></i> Удалить
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно для добавления счета */}
      {showAccountModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Добавить счет</h2>
              <button 
                onClick={() => setShowAccountModal(false)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Название счета:</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Валюта:</label>
                <select
                  value={newAccount.currency}
                  onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                  className={`${styles.formControl} ${styles.selectControl}`}
                  required
                >
                  {Object.entries(currencySymbols).map(([code, symbol]) => (
                    <option key={code} value={code}>{code} ({symbol})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Начальный баланс:</label>
                <input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({
                    ...newAccount, 
                    balance: Math.max(0, parseFloat(e.target.value) || 0)
                  })}
                  className={styles.formControl}
                  step="0.01"
                  min="0"
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
              >
                <i className="fas fa-check"></i> Создать счет
              </button>
            </form>
          </div>
        </div>
      )}

      <LogoutButton />
    </div>
  );
}