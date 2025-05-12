// src/pages/CategoriesPage.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories, addCategory, deleteCategory } from '../redux/actions/categoryActions';
import { toast } from 'react-toastify';
import styles from '../styles/CategoriesPage.module.css'

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

const EMOJI_GROUPS = {
  'Food': ['🍎', '🍔', '🍕', '🍟', '🌮', '🍣', '🍜', '🍦', '☕', '🍺'],
  'Transport': ['🚗', '🚕', '🚲', '✈️', '🚆', '🚢', '🛵', '🚀'],
  'Finance': ['💰', '💵', '💳', '🏦', '📈', '💲'],
  'Entertainment': ['🎬', '🎮', '🎧', '🎤', '🎭', '🎲'],
  'Shopping': ['🛍️', '👕', '👠', '🛒', '🎁'],
  'Health': ['💊', '🏥', '🚑', '🩺', '💉'],
  'Education': ['📚', '🎓', '✏️', '📝', '🏫'],
  'Home': ['🏠', '🛋️', '🛏️', '🚿', '🍳'],
  'Other': ['❤️', '⭐', '🎯', '🔑', '⏰']
};


export default function CategoriesPage() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showCustomIconInput, setShowCustomIconInput] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    icon: '💰', 
    color: '#4CAF50',
    customIcon: '' 
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
    
    if (!newCategory.icon) {
      toast.error('Выберите иконку');
      return;
    }
  
    try {
      await dispatch(addCategory({
        ...newCategory,
        userId: user.id,
        // Убедимся, что сохраняем именно выбранную иконку
        icon: newCategory.icon 
      }));
      
      setShowModal(false);
      setNewCategory({
        name: '',
        type: 'expense',
        icon: '💰',
        color: '#4CAF50',
        customIcon: ''
      });
      setShowCustomIconInput(false);
      
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className={`${styles.icon} fas fa-tags`}></i>
          Categories settings
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className={styles.addButton}
        >
          <i className="fas fa-plus"></i> New category
        </button>
      </div>

      <Link to="/dashboard" className={styles.backLink}>
        <i className="fas fa-arrow-left"></i> Back
      </Link>

      {/*доход*/}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <i className={`${styles.sectionIcon} fas fa-money-bill-wave`}></i>
          Incomes
          <span className={styles.countBadge}>
            {defaultIncomeCategories.length + userIncomeCategories.length}
          </span>
        </h2>
        
        <div className={styles.categoriesGrid}>
          {defaultIncomeCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              isDefault={true}
              onDelete={handleDeleteCategory}
            />
          ))}
          {userIncomeCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              isDefault={false}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      </section>

      {/* расход */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <i className={`${styles.sectionIcon} fas fa-shopping-cart`}></i>
          Expenses
          <span className={styles.countBadge}>
            {defaultExpenseCategories.length + userExpenseCategories.length}
          </span>
        </h2>
        
        <div className={styles.categoriesGrid}>
          {defaultExpenseCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              isDefault={true}
              onDelete={handleDeleteCategory}
            />
          ))}
          {userExpenseCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              isDefault={false}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      </section>

      {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>
          <i className={`${styles.modalIcon} fas fa-plus-circle`}></i>
          New category
        </h2>
        <button 
          onClick={() => {
            setShowModal(false);
            setShowCustomIconInput(false);
            setNewCategory({
              name: '',
              type: 'expense',
              icon: '💰',
              color: '#4CAF50',
              customIcon: ''
            });
          }}
          className={styles.closeButton}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <form onSubmit={handleAddCategory} className={styles.modalForm}>
        {/* Поле выбора типа категории */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Type </label>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                newCategory.type === 'income' ? styles.toggleButtonActive : ''
              }`}
              onClick={() => setNewCategory({...newCategory, type: 'income'})}
            >
              <i className="fas fa-arrow-down"></i> Income
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                newCategory.type === 'expense' ? styles.toggleButtonActive : ''
              }`}
              onClick={() => setNewCategory({...newCategory, type: 'expense'})}
            >
              <i className="fas fa-arrow-up"></i> Expenses
            </button>
          </div>
        </div>

        {/* Поле названия категории */}
        <div className={styles.formGroup}>
          <label htmlFor="categoryName" className={styles.formLabel}>
            Category name
          </label>
          <div className={styles.inputWithIcon}>
            <i className={`${styles.inputIcon} fas fa-tag`}></i>
            <input
              id="categoryName"
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className={styles.formInput}
              placeholder="Example: foods"
              required
            />
          </div>
        </div>

        {/* Поле выбора иконки */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Icons</label>
          
          {!showCustomIconInput ? (
            <>
              <div className={styles.emojiGrid}>
                {Object.entries(EMOJI_GROUPS).map(([group, icons]) => (
                  <details key={group} className={styles.emojiGroup}>
                    <summary className={styles.emojiGroupTitle}>
                      <i className={`${styles.groupIcon} fas fa-${
                        group === 'Food' ? 'utensils' :
                        group === 'Transport' ? 'car' :
                        group === 'Finance' ? 'money-bill-wave' :
                        group === 'Entertainment' ? 'gamepad' :
                        group === 'Shopping' ? 'shopping-bag' :
                        group === 'Health' ? 'heartbeat' :
                        group === 'Education' ? 'graduation-cap' :
                        group === 'Home' ? 'home' : 'star'                        
                      }`}></i>
                      {group}
                    </summary>
                    <div className={styles.emojiGroupContent}>
                      {icons.map(emoji => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => setNewCategory({...newCategory, icon: emoji})}
                          className={`${styles.emojiButton} ${
                            newCategory.icon === emoji ? styles.emojiButtonActive : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => setShowCustomIconInput(true)}
                className={styles.customIconButton}
              >
                <i className="fas fa-edit"></i> Upload your own icon
              </button>
            </>
          ) : (
            <div className={styles.customIconContainer}>
              <div className={styles.inputWithIcon}>
                <i className={`${styles.inputIcon} fas fa-icons`}></i>
                <input
                  type="text"
                  value={newCategory.customIcon}
                  onChange={(e) => setNewCategory({
                    ...newCategory, 
                    customIcon: e.target.value,
                    icon: e.target.value
                  })}
                  className={styles.formInput}
                  placeholder="Enter an emoji (e.g., 🚗)" 
                  maxLength="2"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCustomIconInput(false);
                  setNewCategory({...newCategory, customIcon: ''});
                }}
                className={styles.cancelCustomIcon}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Превью иконки */}
        <div className={styles.iconPreview}>
          <span 
            className={styles.previewIcon}
            style={{ 
              backgroundColor: `${newCategory.color}20`,
              color: newCategory.color
            }}
          >
            {newCategory.icon}
          </span>
          <span className={styles.previewText}>
            This is how your icon will look
          </span>
        </div>

        {/* Поле выбора цвета */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Category color</label>
          <div className={styles.colorPickerContainer}>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
              className={styles.colorInput}
            />
            <span className={styles.colorValue}>{newCategory.color}</span>
          </div>
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!newCategory.name || !newCategory.icon}
        >
          <i className="fas fa-check"></i> Create category
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
    <div className={`${styles.categoryCard} ${isDefault ? styles.defaultCard : ''}`}>
      <div className={styles.categoryIconWrapper} style={{ backgroundColor: `${category.color}20` }}>
        <span style={{ color: category.color }}>{category.icon}</span>
      </div>
      
      <div className={styles.categoryInfo}>
        <h3 className={styles.categoryName}>{category.name}</h3>
        <span className={styles.categoryType}>
          {isDefault ? 'Default' : 'Custom'}
        </span>
      </div>
      
      {!isDefault && (
        <button 
          onClick={() => onDelete(category.id)}
          className={styles.deleteButton}
          title="Delete category"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </div>
  );
}