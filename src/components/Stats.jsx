import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Statistics = ({ 
  incomesByCategory = [], 
  expensesByCategory = [], 
  currencySymbol = '₽',
  transactions = []
}) => {
  // Стандартные категории доходов
  const defaultIncomeCategories = [
    { id: 'default_salary', name: 'Зарплата', color: '#4CAF50' },
    { id: 'default_bonus', name: 'Премия', color: '#8BC34A' },
    { id: 'default_other_income', name: 'Другие доходы', color: '#CDDC39' }
  ];

  // Стандартные категории расходов
  const defaultExpenseCategories = [
    { id: 'default_food', name: 'Еда', color: '#F44336' },
    { id: 'default_transport', name: 'Транспорт', color: '#E91E63' },
    { id: 'default_utilities', name: 'Коммунальные услуги', color: '#9C27B0' },
    { id: 'default_entertainment', name: 'Развлечения', color: '#673AB7' }
  ];

  // Состояние для фильтрации по дате
  const [dateRange, setDateRange] = useState(() => {
    const savedRange = localStorage.getItem('statsDateRange');
    return savedRange ? JSON.parse(savedRange) : {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    };
  });

  // Сохраняем выбранный диапазон дат
  useEffect(() => {
    localStorage.setItem('statsDateRange', JSON.stringify(dateRange));
  }, [dateRange]);

  // Фильтруем транзакции по выбранному периоду
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date).toISOString().split('T')[0];
    return txDate >= dateRange.start && txDate <= dateRange.end;
  });

  // Подсчет сумм по всем категориям (стандартные + пользовательские)
  const calculateCategoryTotals = (categories, type) => {
    return categories.map(category => {
      const total = filteredTransactions
        .filter(tx => {
          // Для стандартных категорий проверяем по имени
          if (category.id.startsWith('default_')) {
            return tx.category === category.name && tx.type === type;
          }
          // Для пользовательских категорий проверяем по id
          return tx.categoryId === category.id && tx.type === type;
        })
        .reduce((sum, tx) => sum + (type === 'income' ? tx.amount : Math.abs(tx.amount)), 0);
      
      return {
        ...category,
        total: parseFloat(total.toFixed(2))
      };
    }).filter(c => c.total > 0);
  };

  // Объединяем все категории
  const allIncomeCategories = [...defaultIncomeCategories, ...incomesByCategory];
  const allExpenseCategories = [...defaultExpenseCategories, ...expensesByCategory];

  const incomeData = calculateCategoryTotals(allIncomeCategories, 'income');
  const expenseData = calculateCategoryTotals(allExpenseCategories, 'expense');

  // Подготовка данных для PieChart
  const preparePieData = (categories) => ({
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => c.total),
      backgroundColor: categories.map(c => c.color),
      borderWidth: 1
    }]
  });

  // Подготовка данных для BarChart (по месяцам)
  const prepareBarData = () => {
    const monthsInRange = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (currentDate <= endDate) {
      monthsInRange.push({
        monthName: currentDate.toLocaleString('default', { month: 'short' }),
        monthNumber: currentDate.getMonth(),
        year: currentDate.getFullYear()
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return monthsInRange.map(({monthName, monthNumber, year}) => {
      const monthTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === monthNumber && txDate.getFullYear() === year;
      });

      return {
        month: `${monthName} ${year}`,
        income: monthTransactions
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0),
        expense: monthTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0)
      };
    });
  };

  const barChartData = {
    labels: prepareBarData().map(m => m.month),
    datasets: [
      {
        label: 'Доходы',
        data: prepareBarData().map(m => m.income),
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Расходы',
        data: prepareBarData().map(m => m.expense),
        backgroundColor: '#F44336',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(2)} ${currencySymbol}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toFixed(2)} ${currencySymbol}`
        }
      }
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Статистика</h1>
      
      {/* Фильтр по дате */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Фильтр по дате</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 text-sm font-medium">Начальная дата:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full p-2 border rounded"
              max={dateRange.end}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 text-sm font-medium">Конечная дата:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full p-2 border rounded"
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Доходы */}
        <div className="p-4 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Доходы по категориям</h3>
          {incomeData.length > 0 ? (
            <>
              <div className="h-64">
                <Pie data={preparePieData(incomeData)} options={chartOptions} />
              </div>
              <div className="mt-4">
                {incomeData.map(category => (
                  <div key={category.id} className="flex justify-between items-center mb-1">
                    <span className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                    <span>
                      {category.total.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Нет данных о доходах за выбранный период</p>
          )}
        </div>
        
        {/* Расходы */}
        <div className="p-4 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Расходы по категориям</h3>
          {expenseData.length > 0 ? (
            <>
              <div className="h-64">
                <Pie data={preparePieData(expenseData)} options={chartOptions} />
              </div>
              <div className="mt-4">
                {expenseData.map(category => (
                  <div key={category.id} className="flex justify-between items-center mb-1">
                    <span className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                    <span>
                      {category.total.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Нет данных о расходах за выбранный период</p>
          )}
        </div>
      </div>

      {/* График динамики */}
      <div className="p-4 bg-white rounded-xl shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Динамика доходов и расходов</h3>
        <div className="h-96">
          {prepareBarData().length > 0 ? (
            <Bar data={barChartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500 text-center py-20">
              Нет данных для отображения за выбранный период
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;