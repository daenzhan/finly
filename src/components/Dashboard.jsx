import React, { useEffect, useState } from 'react';
import { useParams,Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Money } from '../utils';
import { fetchAccounts,addAccount } from '../redux/actions/accountActions';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from '../redux/actions/transactionActions';
import { fetchCategories } from '../redux/actions/categoryActions';
import { toast } from 'react-toastify';
import LogoutButton from '../components/LogoutButton';

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  // Объединяем стандартные и пользовательские категории
  const userIncomeCategories = categories?.filter(cat => cat.type === 'income') || [];
  const userExpenseCategories = categories?.filter(cat => cat.type === 'expense') || [];

  const incomeCategories = [...defaultIncomeCategories, ...userIncomeCategories];
  const expenseCategories = [...defaultExpenseCategories, ...userExpenseCategories];

  // Фильтрация транзакций по дате
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

  // В функции handleSubmit обновите создание транзакции:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const amount = parseFloat(formData.amount);
  if (isNaN(amount) || amount <= 0) {
    toast.error('Введите корректную сумму');
    return;
  }

  // Находим выбранную категорию
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
    // Важно сохранять оба поля!
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
  
    // Создаем полный список всех категорий
    const allCategories = [
      ...defaultIncomeCategories,
      ...defaultExpenseCategories,
      ...userIncomeCategories,
      ...userExpenseCategories
    ];
  
    // Функция для группировки транзакций по категориям
    const groupByCategory = (transactions, type) => {
      const result = {};
      
      // Инициализируем все категории
      allCategories
        .filter(c => c.type === type)
        .forEach(cat => {
          result[cat.id] = {
            ...cat,
            total: 0
          };
        });
  
      // Считаем суммы
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

  const { totalIncome, totalExpense, incomesByCategory, expensesByCategory } = calculateTransactions();
  const balance = totalIncome - totalExpense;

  const getCurrencySymbol = (currency = user?.currency) => {
    return currencySymbols[currency] || currency;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="p-4 text-red-500">Ошибка: {error}</div>;
  if (!user) return <div className="p-4">Пользователь не авторизован</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Добро пожаловать в Finly, {user.name || user.email}!
      </h1>

      <Link 
        to="/stats" 
         className="inline-block mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
         Перейти к статистике →
      </Link>
      <Link 
        to="/categories" 
        className="inline-block mb-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
         >
            Управление категориями →
      </Link>
      
      {/* Общий баланс */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Общий баланс</h2>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Money.format(balance)} {getCurrencySymbol()}
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-green-600">
            Доходы: +{Money.format(totalIncome)} {getCurrencySymbol()}
          </div>
          <div className="text-red-600">
            Расходы: -{Money.format(totalExpense)} {getCurrencySymbol()}
          </div>
        </div>
      </div>
      
      {/* Фильтр по дате */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block mb-1 text-sm font-medium">С:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">По:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Блок счетов */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ваши счета</h2>
          <span className="text-gray-500">
            Общий баланс: {Money.format(
              accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
            )} {getCurrencySymbol()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between">
                <span className="font-medium">{acc.name}</span>
                <span className={acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Money.format(acc.balance)} {getCurrencySymbol(acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* История транзакций */}
      <div className="mb-8 p-5 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">История транзакций</h2>
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500">Нет транзакций за выбранный период</p>
        ) : (
          <div className="space-y-3">
            {filteredTransactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(tx => {
                const category = [...incomeCategories, ...expenseCategories]
                  .find(cat => cat.id === tx.categoryId);
                const account = accounts.find(acc => acc.id === tx.accountId);
                
                return (
                  <div 
                    key={tx.id} 
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-2xl"
                        style={{ color: category?.color }}
                      >
                        {category?.icon || '💸'}
                      </span>
                      <div>
                        <div className="font-medium">{category?.name || 'Неизвестно'}</div>
                        <div className="text-sm text-gray-500">
                          {account?.name} • {new Date(tx.date).toLocaleDateString()}
                        </div>
                        {tx.comment && (
                          <div className="text-sm text-gray-500 mt-1">"{tx.comment}"</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-semibold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {Money.format(Math.abs(tx.amount))} {getCurrencySymbol()}
                      </div>
                      <button 
                        onClick={() => handleEditTransaction(tx)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                         onClick={() => handleDeleteTransaction(tx.id)}
                         className="text-red-500 hover:text-red-700 ml-2"
                         title="Удалить транзакцию"
                      >
                         ×
                     </button>
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
        className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 transition-colors"
        title="Добавить транзакцию"
      >
        +
      </button>

      {/* Кнопка добавления счета */}
      <button 
        onClick={() => setShowAccountModal(true)}
        className="fixed bottom-36 right-6 bg-purple-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-purple-600 transition-colors"
        title="Добавить счет"
      >
        💳
      </button>
      
      {/* Модальное окно для добавления/редактирования транзакции */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingTransaction ? 'Редактировать транзакцию' : 'Добавить транзакцию'}
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Тип транзакции:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg ${transactionType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setTransactionType('income')}
                >
                  Доход
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg ${transactionType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setTransactionType('expense')}
                >
                  Расход
                </button>
              </div>
            </div>

            <form onSubmit={editingTransaction ? handleUpdateTransaction : handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Счет:</label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Выберите счет</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Категория:</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div className="mb-4">
                <label className="block mb-2 font-medium">Сумма:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Дата:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-medium">Комментарий:</label>
                <input
                  type="text"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Необязательно"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {editingTransaction ? 'Обновить' : 'Добавить'}
                </button>
                {editingTransaction && (
                  <button
                    type="button"
                    className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    onClick={() => handleDeleteTransaction(editingTransaction.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      

      {/* Модальное окно для добавления счета */}
        {showAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Добавить счет</h2>
                <button 
                 onClick={() => setShowAccountModal(false)}
                 className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
             <form onSubmit={handleAddAccount}>
               <div className="mb-4">
                 <label className="block mb-2 font-medium">Название счета:</label>
                 <input
                   type="text"
                   value={newAccount.name}
                   onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>

              <div className="mb-4">
               <label className="block mb-2 font-medium">Валюта:</label>
               <select
                   value={newAccount.currency}
                   onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   required
                 >
                  {Object.entries(currencySymbols).map(([code, symbol]) => (
                    <option key={code} value={code}>{code} ({symbol})</option>
                  ))}
               </select>
             </div>

             <div className="mb-4">
               <label className="block mb-2 font-medium">Начальный баланс:</label>
               <input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({
                   ...newAccount, 
                   balance: Math.max(0, parseFloat(e.target.value) || 0)
                  })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  min="0"
               />
             </div>

             <button
               type="submit"
               className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
               >
                Создать счет
              </button>
           </form>
         </div>
       </div>
     )}   

     <LogoutButton />    
    </div>
  );
}