import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, deleteCategory } from '../store/actions/categoryActions';

const Settings = () => {
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    icon: '💰',
    color: '#FF6384'
  });
  const { items: categories } = useSelector(state => state.categories);
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(createCategory({
      ...newCategory,
      userId: useSelector(state => state.auth.user.id)
    }));
    setNewCategory({ ...newCategory, name: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Настройки категорий</h2>
      {/* Форма добавления */}
      {/* Список категорий */}
    </div>
  );
};