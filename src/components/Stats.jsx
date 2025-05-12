import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { defaultIncomeCategories, defaultExpenseCategories } from './categories';
import styles from '../styles/StatsPage.module.css';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Statistics = ({ 
  transactions = [],
  currencySymbol = '₽',
  incomesByCategory = [],
  expensesByCategory = []
}) => {
  const [dateRange, setDateRange] = useState(() => {
    const savedRange = localStorage.getItem('statsDateRange');
    return savedRange ? JSON.parse(savedRange) : {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    localStorage.setItem('statsDateRange', JSON.stringify(dateRange));
  }, [dateRange]);

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date).toISOString().split('T')[0];
    return txDate >= dateRange.start && txDate <= dateRange.end;
  });

  const calculateCategoryTotals = (type) => {
    const result = {};

    const defaultCategories = type === 'income' 
      ? [...defaultIncomeCategories, ...incomesByCategory]
      : [...defaultExpenseCategories, ...expensesByCategory];

    defaultCategories.forEach(cat => {
      result[cat.id] = {
        ...cat,
        total: 0
      };
    });

    result['unknown'] = {
      id: 'unknown',
      name: 'Unknown category"',
      color: '#CCCCCC',
      total: 0
    };

    filteredTransactions
      .filter(tx => tx.type === type)
      .forEach(tx => {
        const categoryId = tx.categoryId || 'unknown';
        if (!result[categoryId]) {
          result[categoryId] = {
            ...getCategoryById(categoryId),
            total: 0
          };
        }
        result[categoryId].total += Math.abs(tx.amount);
      });

    return Object.values(result)
      .map(item => ({ ...item, total: parseFloat(item.total.toFixed(2)) }))
      .filter(item => item.total > 0);
  };

  const incomeData = calculateCategoryTotals('income');
  const expenseData = calculateCategoryTotals('expense');

  const preparePieData = (categories) => ({
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => c.total),
      backgroundColor: categories.map(c => c.color),
      borderWidth: 1
    }]
  });

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
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
        expense: monthTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
      };
    });
  };

  const barChartData = {
    labels: prepareBarData().map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: prepareBarData().map(m => m.income),
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Expense',
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

  const getCategoryById = (categoryId) => {
    const allCategories = [
      ...defaultIncomeCategories,
      ...defaultExpenseCategories,
      ...incomesByCategory,
      ...expensesByCategory
    ];
    
    const foundCategory = allCategories.find(c => c.id === categoryId);
    
    return foundCategory || {
      id: 'unknown',
      name: 'Неизвестная категория',
      color: '#CCCCCC'
    };
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <i className={`${styles.icon} fas fa-chart-pie`} />
        Statistics
      </h1>
      <Link to="/dashboard" className={styles.backLink}>
              <i className="fas fa-arrow-left"></i> Back
            </Link>
      
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>
          <i className={`${styles.filterIcon} fas fa-filter`} />
          Date filter
        </h3>
        <div className={styles.dateInputs}>
          <div className={styles.dateInputGroup}>
            <label className={styles.dateLabel}>Start date:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className={styles.dateInput}
              max={dateRange.end}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label className={styles.dateLabel}>End date:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className={styles.dateInput}
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>
            <i className={`${styles.chartIcon} fas fa-money-bill-wave`} />
            Income by categories
          </h3>
          {incomeData.length > 0 ? (
            <>
              <div className={styles.chartWrapper}>
                <Pie data={preparePieData(incomeData)} options={chartOptions} />
              </div>
              <div className={styles.categoryList}>
                {incomeData.map(category => (
                  <div key={category.id} className={styles.categoryItem}>
                    <span className={styles.categoryInfo}>
                      <span 
                        className={styles.categoryColor} 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={styles.categoryName}>{category.name}</span>
                    </span>
                    <span className={styles.categoryAmount}>
                      {category.total.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.noData}>There is no income data for the selected period</p>
          )}
        </div>
        
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>
            <i className={`${styles.chartIcon} fas fa-shopping-cart`} />
            Expenses by categories
          </h3>
          {expenseData.length > 0 ? (
            <>
              <div className={styles.chartWrapper}>
                <Pie data={preparePieData(expenseData)} options={chartOptions} />
              </div>
              <div className={styles.categoryList}>
                {expenseData.map(category => (
                  <div key={category.id} className={styles.categoryItem}>
                    <span className={styles.categoryInfo}>
                      <span 
                        className={styles.categoryColor} 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={styles.categoryName}>{category.name}</span>
                    </span>
                    <span className={styles.categoryAmount}>
                      {category.total.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.noData}>There is no expense data for the selected period</p>
          )}
        </div>
      </div>

      <div className={styles.dynamicChartContainer}>
        <h3 className={styles.chartTitle}>
          <i className={`${styles.chartIcon} fas fa-chart-line`} />
          Income and expense dynamics
        </h3>
        <div className={styles.dynamicChartWrapper}>
          {prepareBarData().length > 0 ? (
            <Bar data={barChartData} options={chartOptions} />
          ) : (
            <p className={styles.noData}>
              There is no data to display for the selected period
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;