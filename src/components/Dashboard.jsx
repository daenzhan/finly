import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAccounts } from '../redux/actions/accountActions';
import { fetchTransactions, addTransaction } from '../redux/actions/transactionActions';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KZT: '₸',
};

const incomeCategories = [
  { id: 'salary', name: 'Зарплата', icon: '💼' },
  { id: 'scholarship', name: 'Стипендия', icon: '🎓' },
  { id: 'pension', name: 'Пенсия', icon: '👵' },
  { id: 'other_income', name: 'Другое', icon: '💰' }
];

const expenseCategories = [
  { id: 'transport', name: 'Транспорт', icon: '🚕' },
  { id: 'products', name: 'Продукты', icon: '🍎' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎬' },
  { id: 'other_expense', name: 'Другое', icon: '💸' }
];

export default function Dashboard() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
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

  const loading = accountsLoading || transactionsLoading;
  const error = accountsError || transactionsError;

  useEffect(() => {
    dispatch(fetchAccounts(userId));
    dispatch(fetchTransactions(userId));
  }, [dispatch, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    const newTransaction = {
      userId,
      accountId: formData.accountId,
      categoryId: formData.categoryId,
      amount: transactionType === 'income' ? amount : -amount,
      date: formData.date,
      comment: formData.comment,
      type: transactionType,
      createdAt: new Date().toISOString()
    };

    try {
      await dispatch(addTransaction(newTransaction));
      setShowModal(false);
      setFormData({
        accountId: '',
        categoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
    } catch (error) {
      console.error("Ошибка при создании транзакции:", error);
    }
  };

  const calculateTransactions = () => {
    const incomeTransactions = transactions.filter(tx => tx.type === 'income');
    const expenseTransactions = transactions.filter(tx => tx.type === 'expense');

    const totalIncome = incomeTransactions.reduce(
      (sum, tx) => sum + (parseFloat(tx.amount) || 0), 0
    );
    const totalExpense = expenseTransactions.reduce(
      (sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0
    );

    const incomesByCategory = incomeCategories.map(category => {
      const categoryTotal = incomeTransactions
        .filter(tx => tx.categoryId === category.id)
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
      
      return {
        ...category,
        total: categoryTotal,
        percentage: totalIncome > 0 ? Math.round((categoryTotal / totalIncome) * 100) : 0
      };
    });

    const expensesByCategory = expenseCategories.map(category => {
      const categoryTotal = expenseTransactions
        .filter(tx => tx.categoryId === category.id)
        .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);
      
      return {
        ...category,
        total: categoryTotal,
        percentage: totalExpense > 0 ? Math.round((categoryTotal / totalExpense) * 100) : 0
      };
    });

    return { totalIncome, totalExpense, incomesByCategory, expensesByCategory };
  };

  const { totalIncome, totalExpense, incomesByCategory, expensesByCategory } = calculateTransactions();
  const balance = totalIncome - totalExpense;

  const getCurrencySymbol = (currency = user?.currency) => {
    return currencySymbols[currency] || currency;
  };

  if (loading) return <div className="p-4">Загрузка...</div>;
  if (error) return <div className="p-4 text-red-500">Ошибка: {error}</div>;
  if (!user) return <div className="p-4">Пользователь не авторизован</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Добро пожаловать, {user.name || user.email}!
      </h1>
      
      {/* Общий баланс */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Общий баланс</h2>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance.toFixed(2)} {getCurrencySymbol()}
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-green-600">
            Доходы: +{totalIncome.toFixed(2)} {getCurrencySymbol()}
          </div>
          <div className="text-red-600">
            Расходы: -{totalExpense.toFixed(2)} {getCurrencySymbol()}
          </div>
        </div>
      </div>
      
      {/* Блок доходов */}
      <div className="mb-8 p-5 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Доходы</h2>
          <span className="text-gray-500">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        {/* Доходы по категориям */}
        <div className="space-y-3">
          {incomesByCategory.map(category => (
            <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </div>
                <span className="font-medium text-green-600">
                  +{category.total.toFixed(2)} {getCurrencySymbol()}
                </span>
              </div>
              {category.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Блок расходов */}
      <div className="mb-8 p-5 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Расходы</h2>
          <span className="text-gray-500">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        {/* Расходы по категориям */}
        <div className="space-y-3">
          {expensesByCategory.map(category => (
            <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </div>
                <span className="font-medium text-red-600">
                  -{category.total.toFixed(2)} {getCurrencySymbol()}
                </span>
              </div>
              {category.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Блок счетов */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ваши счета</h2>
          <span className="text-gray-500">
            Общий баланс: {accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0).toFixed(2)} {getCurrencySymbol()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between">
                <span className="font-medium">{acc.name}</span>
                <span className={acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {acc.balance?.toFixed(2) || '0.00'} {getCurrencySymbol(acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

        <div className="mb-8 p-5 bg-white rounded-xl shadow-md">
  <h2 className="text-xl font-semibold mb-4">История транзакций</h2>
  <div className="space-y-3">
    {transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Сортировка по дате
      .map(tx => {
        const category = [...incomeCategories, ...expenseCategories]
          .find(cat => cat.id === tx.categoryId);
        const account = accounts.find(acc => acc.id === tx.accountId);
        
        return (
          <div 
            key={tx.id} 
            className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category?.icon || '💸'}</span>
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
            <div className={`text-lg font-semibold ${
              tx.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {tx.type === 'income' ? '+' : '-'}
              {Math.abs(tx.amount).toFixed(2)} {getCurrencySymbol()}
            </div>
          </div>
        );
      })}
  </div>
</div>

      {/* Кнопка добавления транзакции */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 transition-colors"
      >
        +
      </button>
      
      {/* Модальное окно для добавления транзакции */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Добавить транзакцию</h2>
              <button 
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSubmit}>
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
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))
                  ) : (
                    expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
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

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Добавить транзакцию
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}