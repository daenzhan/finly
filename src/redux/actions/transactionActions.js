// src/redux/actions/transactionActions.js
import API from '../../api/api';
import { fetchAccounts } from './accountActions';
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
  ADD_TRANSACTION_REQUEST,
  ADD_TRANSACTION_SUCCESS,
  ADD_TRANSACTION_FAILURE,
  UPDATE_ACCOUNT_SUCCESS,
  UPDATE_TRANSACTION_REQUEST,
  UPDATE_TRANSACTION_SUCCESS,
  UPDATE_TRANSACTION_FAILURE,
  DELETE_TRANSACTION_REQUEST,
  DELETE_TRANSACTION_SUCCESS,
  DELETE_TRANSACTION_FAILURE,
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

export const updateTransaction = (transactionData) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_TRANSACTION_REQUEST });
  
  try {
    // 1. Получаем текущее состояние
    const state = getState();
    const oldTransaction = state.transactions.data.find(t => t.id === transactionData.id);
    
    // 2. Обновляем транзакцию на сервере
    const response = await API.patch(`/transactions/${transactionData.id}`, {
      accountId: transactionData.accountId,
      categoryId: transactionData.categoryId,
      amount: transactionData.amount,
      date: transactionData.date,
      comment: transactionData.comment,
      type: transactionData.type
    });

    dispatch({ type: UPDATE_TRANSACTION_SUCCESS, payload: response.data });

    // 3. Если изменился счёт, обновляем балансы
    if (oldTransaction && oldTransaction.accountId !== transactionData.accountId) {
      // Старый счёт (уменьшаем на старую сумму)
      const oldAccount = state.accounts.data.find(a => a.id === oldTransaction.accountId);
      if (oldAccount) {
        const oldAccountBalance = parseFloat((oldAccount.balance - oldTransaction.amount).toFixed(2));
        await API.patch(`/accounts/${oldAccount.id}`, { balance: oldAccountBalance });
      }

      // Новый счёт (увеличиваем на новую сумму)
      const newAccount = state.accounts.data.find(a => a.id === transactionData.accountId);
      if (newAccount) {
        const newAccountBalance = parseFloat((newAccount.balance + transactionData.amount).toFixed(2));
        await API.patch(`/accounts/${newAccount.id}`, { balance: newAccountBalance });
      }
    }

    // 4. Обновляем список счетов
    dispatch(fetchAccounts(transactionData.userId));
    
    return response.data;
  } catch (error) {
    dispatch({ type: UPDATE_TRANSACTION_FAILURE, payload: error.message });
    throw error;
  }
};

export const deleteTransaction = (transactionId) => async (dispatch, getState) => {
  dispatch({ type: DELETE_TRANSACTION_REQUEST });
  
  try {
    // 1. Получаем данные транзакции перед удалением
    const transaction = getState().transactions.data.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error('Транзакция не найдена');
    }

    // 2. Удаляем транзакцию
    await API.delete(`/transactions/${transactionId}`);
    
    // 3. Обновляем баланс счета
    const account = getState().accounts.data.find(a => a.id === transaction.accountId);
    if (account) {
      const newBalance = Money.subtract(account.balance, transaction.amount);
      await API.patch(`/accounts/${account.id}`, { balance: Money.to(newBalance) });
    }

    dispatch({ 
      type: DELETE_TRANSACTION_SUCCESS,
      payload: transactionId
    });
    
    // 4. Обновляем данные
    dispatch(fetchAccounts(transaction.userId));
    dispatch(fetchTransactions(transaction.userId));
    
  } catch (error) {
    dispatch({
      type: DELETE_TRANSACTION_FAILURE,
      payload: error.message
    });
    throw error;
  }
};