import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Money } from '../utils';
import { get_accounts_action, add_account_action } from '../redux/actions/accountActions';
import {
  get_transactions_action,
  add_transaction_action,
  update_transaction_action,
  delete_transaction_action
} from '../redux/actions/transactionActions';
import { fetchCategories } from '../redux/actions/categoryActions';
import { toast } from 'react-toastify';
import LogoutButton from './LogoutButton';
import styles from '../styles/Dashboard.module.css';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KZT: '₸',
};

const start_income_category = [
  { id: 'default_salary', name: 'Salary', icon: '💼', color: '#4CAF50', type: 'income' },
  { id: 'default_scholarship', name: 'Scholarship', icon: '🎓', color: '#8BC34A', type: 'income' },
  { id: 'default_pension', name: 'Pension', icon: '👵', color: '#CDDC39', type: 'income' },
  { id: 'default_other_income', name: 'Other', icon: '💰', color: '#FFC107', type: 'income' }
];

const start_expense_category = [
  { id: 'default_transport', name: 'Transport', icon: '🚕', color: '#F44336', type: 'expense' },
  { id: 'default_products', name: 'Groceries', icon: '🍎', color: '#E91E63', type: 'expense' },
  { id: 'default_shopping', name: 'Shopping', icon: '🛍️', color: '#9C27B0', type: 'expense' },
  { id: 'default_entertainment', name: 'Entertainment', icon: '🎬', color: '#673AB7', type: 'expense' },
  { id: 'default_other_expense', name: 'Other', icon: '💸', color: '#3F51B5', type: 'expense' }
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
      dispatch(get_accounts_action(user.id));
      dispatch(get_transactions_action(user.id));
      dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user?.id]);

  const user_income_category = categories?.filter(cat => cat.type === 'income') || [];
  const user_expense_category = categories?.filter(cat => cat.type === 'expense') || [];

  const total_income_category = [...start_income_category, ...user_income_category];
  const total_expense_category = [...start_expense_category, ...user_expense_category];

  const filtered_transactions = transactions?.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= new Date(dateRange.start) && txDate <= new Date(dateRange.end);
  }) || [];

  const calculate_total_balance = () => {
    if (!accounts || !Array.isArray(accounts)) return 0;
    return accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
  };

  const input_change = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const reset_form = () => {
    setFormData({
      accountId: '',
      categoryId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      comment: ''
    });
    setTransactionType('income');
  };

  const submit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) ){
      toast.error('Please enter a valid amount!');
      return;
    }

    const selected_category = [
      ...start_income_category,
      ...start_expense_category,
      ...user_income_category,
      ...user_expense_category
    ].find(c => c.id === formData.categoryId);

    if (!selected_category) {
      toast.error('Please select a category!');
      return;
    }

    const new_transaction = {
      userId: user.id,
      accountId: formData.accountId,
      amount: transactionType === 'income' ? amount : -amount,
      date: formData.date,
      comment: formData.comment,
      type: transactionType,
      createdAt: new Date().toISOString(),
      category: selected_category.name,
      categoryId: selected_category.id
    };

    try {
      await dispatch(add_transaction_action(new_transaction));
      setShowModal(false);
      reset_form();
      toast.success('Transaction added successfully! ^^');
    } catch (error) {
      toast.error('Failed to add transaction!(');
    }
  };

  const edit_transaction = (tx) => {
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

  const update_transaction = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      toast.error('Please enter a valid amount! :3');
      return;
    }
  
    const updated_transaction = {
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
      await dispatch(update_transaction_action(updated_transaction));
      setShowModal(false);
      setEditingTransaction(null);
      reset_form();
      toast.success('Transaction updated successfully! ^^');
    } catch (error) {
      toast.error('Failed to update transaction!(');
    }
  };

  const delete_transaction = async (txId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await dispatch(delete_transaction_action(txId));
        toast.success('Transaction deleted!');
      } catch (error) {
        toast.error(error.message || 'Failed to delete transaction!(');
      }
    }
  };

  const add_account = async (e) => {
    e.preventDefault();
    try {
      await dispatch(add_account_action({
        ...newAccount,
        userId: user.id,
        balance: parseFloat(newAccount.balance) || 0,
        createdAt: new Date().toISOString()
      }));
      setShowAccountModal(false);
      setNewAccount({
        name: '',
        icon: 'wallet',
        balance: 0,
        currency: user?.currency || 'RUB'
      });
      toast.success('Account added successfully!^^');
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error(error.response?.data?.message || 'Failed to add account!(');
    }
  };

  const calculate_transactions = () => {
    if (!filtered_transactions || !Array.isArray(filtered_transactions)) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        incomesByCategory: [],
        expensesByCategory: []
      };
    }
  
    const allCategories = [
      ...start_income_category,
      ...start_expense_category,
      ...user_income_category,
      ...user_expense_category
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
  
    const incomeTransactions = filtered_transactions.filter(tx => tx.type === 'income');
    const expenseTransactions = filtered_transactions.filter(tx => tx.type === 'expense');
  
    return { 
      totalIncome: incomeTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      totalExpense: expenseTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      incomesByCategory: groupByCategory(incomeTransactions, 'income'),
      expensesByCategory: groupByCategory(expenseTransactions, 'expense')
    };
  };

  const { totalIncome, totalExpense } = calculate_transactions();
  const totalBalance = calculate_total_balance();
  const getCurrencySymbol = (currency = user?.currency) => {
    return currencySymbols[currency] || currency;
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
  
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!user) return <div className={styles.error}>User not authorized</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeTitle}>
        Welcome to Finly, {user.name || user.email}!
      </h1>

      <div className={styles.linksContainer}>
        <Link 
          to="/stats" 
          className={`${styles.link} ${styles.linkPrimary}`}
        >
          <i className="fas fa-chart-bar"></i> View Statistics
        </Link>
        <Link 
          to="/categories" 
          className={`${styles.link} ${styles.linkSecondary}`}
        >
          <i className="fas fa-tags"></i> Manage Categories
        </Link>
      </div>
      
      {/* ---- ОБЩИЙ БАЛАНС ---- */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceHeader}>
          <h2 className={styles.balanceTitle}>Total Balance</h2>
          <div className={`${styles.balanceAmount} ${totalBalance >= 0 ? styles.positive : styles.negative}`}>
            {Money.format(totalBalance)} {getCurrencySymbol()}
          </div>
        </div>
        <div className={styles.balanceSummary}>
          <div className={styles.income}>
            Income: +{Money.format(totalIncome)} {getCurrencySymbol()}
          </div>
          <div className={styles.expense}>
            Expenses: -{Money.format(totalExpense)} {getCurrencySymbol()}
          </div>
        </div>
      </div>
      
       {/* ---- ФИЛЬТР!!! ---- */}
      <div className={styles.dateFilter}>
        <div className={styles.dateGroup}>
          <label className={styles.dateLabel}>From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className={styles.dateInput}
          />
        </div>
        <div className={styles.dateGroup}>
          <label className={styles.dateLabel}>To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* ---- СЧЕТА ---- */}
      <div className={styles.accountsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Accounts</h2>
          <span className={styles.sectionSubtitle}>
            Total balance: {Money.format(totalBalance)} {getCurrencySymbol()}
          </span>
        </div>
        <div className={styles.accountsGrid}>
          {accounts.map((acc) => (
            <div key={acc.id} className={styles.accountCard}>
              <div className={styles.accountContent}>
                <span className={styles.accountName}>{acc.name}: </span>
                <span className={acc.balance >= 0 ? styles.positive : styles.negative}>
                  {Money.format(acc.balance)} {getCurrencySymbol(acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* ---- история трансакции ---- */}
      <div className={styles.transactionsSection}>
        <h2 className={styles.sectionTitle}>Transaction History</h2>
        {filtered_transactions.length === 0 ? (
          <p className={styles.emptyState}>No transactions for selected period</p>
        ) : (
          <div className={styles.transactionsList}>
            {filtered_transactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(tx => {
                const category = [...total_income_category, ...total_expense_category]
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
                        <div className={styles.transactionCategory}>{category?.name || 'Unknown'}</div>
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
                          onClick={() => edit_transaction(tx)}
                          className={styles.actionButton}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => delete_transaction(tx.id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete transaction"
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

      <button 
        onClick={() => setShowModal(true)}
        className={styles.addButton}
        title="Add transaction"
      >
        <i className="fas fa-plus"></i>
      </button>
      <button 
        onClick={() => setShowAccountModal(true)}
        className={`${styles.addButton} ${styles.addAccountButton}`}
        title="Add account"
      >
        <i className="fas fa-wallet"></i>
      </button>
      
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingTransaction(null);
                  reset_form();
                }}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={editingTransaction ? update_transaction : submit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Transaction Type:</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      transactionType === 'income' ? styles.toggleButtonActive : ''
                    }`}
                    onClick={() => setTransactionType('income')}
                  >
                    <i className="fas fa-arrow-down"></i> Income
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      transactionType === 'expense' ? styles.toggleButtonActive : ''
                    }`}
                    onClick={() => setTransactionType('expense')}
                  >
                    <i className="fas fa-arrow-up"></i> Expense
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Account:</label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={input_change}
                  className={`${styles.formControl} ${styles.selectControl}`}
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category:</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={input_change}
                  className={`${styles.formControl} ${styles.selectControl}`}
                  required
                >
                  <option value="">Select category</option>
                  {transactionType === 'income' ? (
                    total_income_category.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))
                  ) : (
                    total_expense_category.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount:     <i className={`${styles.inputIcon} fas fa-${getCurrencySymbol().replace('₽', 'ruble-sign').replace('$', 'dollar-sign').replace('€', 'euro-sign').replace('₸', 'tenge')}`}></i></label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={input_change}
                    className={styles.formControl}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={input_change}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Comment:</label>
                <input
                  type="text"
                  name="comment"
                  value={formData.comment}
                  onChange={input_change}
                  className={styles.formControl}
                  placeholder="Optional"
                />
              </div>

              <div className={styles.buttonsGroup}>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  <i className="fas fa-check"></i> {editingTransaction ? 'Update' : 'Add'}
                </button>
                {editingTransaction && (
                  <button
                    type="button"
                    className={`${styles.submitButton} ${styles.dangerButton}`}
                    onClick={() => delete_transaction(editingTransaction.id)}
                  >
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Account</h2>
              <button 
                onClick={() => setShowAccountModal(false)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={add_account} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Account Name:</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Currency:</label>
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
                <label className={styles.formLabel}>Initial Balance:</label>
                <input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({
                    ...newAccount, 
                    balance: parseFloat(e.target.value) || 0
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
                <i className="fas fa-check"></i> Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      <LogoutButton />
    </div>
  );
}