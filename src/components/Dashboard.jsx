import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/api';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KZT: '₸',
};

export default function Dashboard() {
  const { userId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accs = await API.get(`/accounts?userId=${userId}`);
        setAccounts(accs.data || accs);

        const txs = await API.get(`/transactions?userId=${userId}`);
        setTransactions(txs.data || txs);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (!user || loading) return <div>Загрузка...</div>;

  const getCurrencySymbol = (currency = user.currency) => {
    return currencySymbols[currency] || currency;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Добро пожаловать, {user.name || user.email}!
      </h1>
      
      <h2 className="text-xl font-semibold mb-2">Ваши счета:</h2>
      <ul className="mb-6">
        {accounts.map((acc) => (
          <li key={acc.id} className="mb-2 p-2 bg-gray-100 rounded">
            {acc.name}: {acc.balance} {getCurrencySymbol(acc.currency)}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Последние транзакции:</h2>
      <ul>
        {transactions.map((tx) => (
          <li 
            key={tx.id} 
            className={`mb-2 p-2 rounded ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}
          >
            {tx.category}: {tx.amount} {getCurrencySymbol()}
            <div className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}