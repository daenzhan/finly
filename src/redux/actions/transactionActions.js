// src/redux/actions/transactionActions.js
import API from '../../api/api';
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
  ADD_TRANSACTION_REQUEST,
  ADD_TRANSACTION_SUCCESS,
  ADD_TRANSACTION_FAILURE,
  UPDATE_ACCOUNT_SUCCESS,
} from '../types';

export const fetchTransactions = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_TRANSACTIONS_REQUEST });
  try {
    const response = await API.get(`/transactions?userId=${userId}`);
    dispatch({
      type: FETCH_TRANSACTIONS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_TRANSACTIONS_FAILURE,
      payload: error.message,
    });
  }
};

export const addTransaction = (transactionData) => async (dispatch, getState) => {
  dispatch({ type: ADD_TRANSACTION_REQUEST });
  try {
    // Создаем транзакцию
    const txResponse = await API.post('/transactions', transactionData);
    dispatch({
      type: ADD_TRANSACTION_SUCCESS,
      payload: txResponse.data,
    });

    // Обновляем баланс счета
    const { accountId } = transactionData;
    const account = getState().accounts.data.find(acc => acc.id === accountId);
    const newBalance = (account.balance || 0) + txResponse.data.amount;
    const clampedBalance = Math.max(0, newBalance);

    const accResponse = await API.patch(`/accounts/${accountId}`, {
      balance: clampedBalance,
    });

    dispatch({
      type: UPDATE_ACCOUNT_SUCCESS,
      payload: accResponse.data,
    });
  } catch (error) {
    dispatch({
      type: ADD_TRANSACTION_FAILURE,
      payload: error.message,
    });
    throw error;
  }
};
