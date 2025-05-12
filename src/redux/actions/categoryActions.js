// src/redux/actions/categoryActions.js
import API from '../../api/api';
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  ADD_CATEGORY_REQUEST,
  ADD_CATEGORY_SUCCESS,
  ADD_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
} from '../types';

export const fetchCategories = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORIES_REQUEST });
  try {
    const response = await API.get(`/categories?userId=${userId}`);
    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_CATEGORIES_FAILURE,
      payload: error.message,
    });
  }
};

export const addCategory = (categoryData) => async (dispatch) => {
  dispatch({ type: ADD_CATEGORY_REQUEST });
  try {
    const response = await API.post('/categories', categoryData);
    dispatch({
      type: ADD_CATEGORY_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: ADD_CATEGORY_FAILURE,
      payload: error.message,
    });
    throw error;
  }
};

export const deleteCategory = (categoryId) => async (dispatch, getState) => {
    dispatch({ type: DELETE_CATEGORY_REQUEST });
    
    try {
      // 1. Проверяем, используется ли категория в транзакциях
      const transactions = getState().transactions.data;
      const categoryInUse = transactions.some(tx => tx.categoryId === categoryId);
      
      if (categoryInUse) {
        throw new Error('Категория используется в транзакциях');
      }
  
      // 2. Удаляем категорию
      await API.delete(`/categories/${categoryId}`);
      
      dispatch({ 
        type: DELETE_CATEGORY_SUCCESS,
        payload: categoryId
      });
      
      // 3. Обновляем список категорий
      const userId = getState().auth.user?.id;
      if (userId) {
        dispatch(fetchCategories(userId));
      }
      
    } catch (error) {
      dispatch({
        type: DELETE_CATEGORY_FAILURE,
        payload: error.message
      });
      throw error;
    }
  };