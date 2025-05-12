// src/pages/CategoriesPage.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories, addCategory, deleteCategory } from '../redux/actions/categoryActions';
import { toast } from 'react-toastify';

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

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    icon: '💰',
    color: '#4CAF50'
  });

  const { user } = useSelector((state) => state.auth);
  const { 
    data: categories, 
    loading, 
    error 
  } = useSelector((state) => state.categories);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user?.id]);

  const userIncomeCategories = categories?.filter(cat => cat.type === 'income') || [];
  const userExpenseCategories = categories?.filter(cat => cat.type === 'expense') || [];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addCategory({
        ...newCategory,
        userId: user.id
      }));
      setShowModal(false);
      setNewCategory({
        name: '',
        type: 'expense',
        icon: '💰',
        color: '#4CAF50'
      });
      toast.success('Категория добавлена');
    } catch (error) {
      toast.error('Не удалось добавить категорию');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmMessage = `Вы уверены, что хотите удалить эту категорию? 
      ${defaultIncomeCategories.concat(defaultExpenseCategories).some(c => c.id === categoryId) 
        ? 'Это стандартная категория, она будет скрыта.' 
        : 'Все связанные транзакции останутся без категории.'}`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await dispatch(deleteCategory(categoryId));
        toast.success('Категория удалена');
      } catch (error) {
        toast.error(error.message || 'Не удалось удалить категорию');
      }
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление категориями</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Добавить категорию
        </button>
      </div>

      <Link 
        to="/dashboard" 
        className="inline-block mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Назад в Dashboard
      </Link>

      {/* Стандартные категории доходов */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4"> Категории доходов</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultIncomeCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              isDefault={true}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      </div>

      {/* Пользовательские категории доходов */}
      {userIncomeCategories.length > 0 && (
        <div className="mb-8">
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {userIncomeCategories.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                isDefault={false}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        </div>
      )}

      {/* Стандартные категории расходов */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4"> Категории расходов</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultExpenseCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              isDefault={true}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      </div>

      {/* Пользовательские категории расходов */}
      {userExpenseCategories.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {userExpenseCategories.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                isDefault={false}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно для добавления категории */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Добавить категорию</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Тип категории:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg ${newCategory.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setNewCategory({...newCategory, type: 'income'})}
                  >
                    Доход
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg ${newCategory.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setNewCategory({...newCategory, type: 'expense'})}
                  >
                    Расход
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Название:</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Иконка:</label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength="2"
                />
                <p className="text-sm text-gray-500 mt-1">Введите эмодзи (например: 🍎, 🚕, 💰)</p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Цвет:</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-16 h-12"
                  />
                  <span className="p-2 rounded" style={{ backgroundColor: newCategory.color }}>
                    {newCategory.icon} Пример
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Создать категорию
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, isDefault, onDelete }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span 
          className="text-2xl"
          style={{ color: category.color }}
        >
          {category.icon}
        </span>
        <div>
          <div className="font-medium">{category.name}</div>
          <div className="text-sm text-gray-500">
            {isDefault ? 'Стандартная' : 'Пользовательская'}
          </div>
        </div>
      </div>
      {!isDefault && (
        <button 
          onClick={() => onDelete(category.id)}
          className="text-red-500 hover:text-red-700"
          title="Удалить категорию"
        >
          ×
        </button>
      )}
    </div>
  );
}