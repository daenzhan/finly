// src/redux/actions/accountActions.js
import API from '../../api/api';
import {
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_FAILURE,
  ADD_ACCOUNT_REQUEST,
  ADD_ACCOUNT_SUCCESS,
  ADD_ACCOUNT_FAILURE,
  UPDATE_ACCOUNT_SUCCESS
} from '../types';
import { toast } from 'react-toastify';

export const fetchAccounts = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_ACCOUNTS_REQUEST });
  try {
    const response = await API.get(`/accounts?userId=${userId}`);
    dispatch({
      type: FETCH_ACCOUNTS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_ACCOUNTS_FAILURE,
      payload: error.message,
    });
    toast.error('Ошибка загрузки счетов');
  }
};

export const addAccount = (accountData) => async (dispatch) => {
  dispatch({ type: ADD_ACCOUNT_REQUEST });
  try {
    const response = await API.post('/accounts', accountData);
    dispatch({
      type: ADD_ACCOUNT_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: ADD_ACCOUNT_FAILURE,
      payload: error.message,
    });
    toast.error(error.response?.data?.message || 'Не удалось добавить счет');
    throw error;
  }
};