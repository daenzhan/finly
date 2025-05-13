import API from '../../api/api';
import { get_accounts_action } from './accountActions';
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


export const get_transactions_action = (userId) => async (dispatch) => {
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

export const add_transaction_action = (transactionData) => async (dispatch, getState) => {
  dispatch({ type: ADD_TRANSACTION_REQUEST });
  try {
    const txResponse = await API.post('/transactions', transactionData);
    dispatch({
      type: ADD_TRANSACTION_SUCCESS,
      payload: txResponse.data,
    });

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

export const update_transaction_action = (transactionData) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_TRANSACTION_REQUEST });
  
  try {
    const state = getState(); // нынишнее состояние ;3
    const oldTransaction = state.transactions.data.find(t => t.id === transactionData.id);
    
    const response = await API.patch(`/transactions/${transactionData.id}`, {
      accountId: transactionData.accountId,
      categoryId: transactionData.categoryId,
      amount: transactionData.amount,
      date: transactionData.date,
      comment: transactionData.comment,
      type: transactionData.type
    });

    dispatch({ type: UPDATE_TRANSACTION_SUCCESS, payload: response.data });

    if (oldTransaction && oldTransaction.accountId !== transactionData.accountId) {
      const oldAccount = state.accounts.data.find(a => a.id === oldTransaction.accountId);
      if (oldAccount) {
        const oldAccountBalance = parseFloat((oldAccount.balance - oldTransaction.amount).toFixed(2));
        await API.patch(`/accounts/${oldAccount.id}`, { balance: oldAccountBalance });
      }

      const newAccount = state.accounts.data.find(a => a.id === transactionData.accountId);
      if (newAccount) {
        const newAccountBalance = parseFloat((newAccount.balance + transactionData.amount).toFixed(2));
        await API.patch(`/accounts/${newAccount.id}`, { balance: newAccountBalance });
      }
    }

    // 4. Обновляем список счетов
    dispatch(get_accounts_action(transactionData.userId));
    
    return response.data;
  } catch (error) {
    dispatch({ type: UPDATE_TRANSACTION_FAILURE, payload: error.message });
    throw error;
  }
};

export const delete_transaction_action = (transactionId) => async (dispatch, getState) => {
  dispatch({ type: DELETE_TRANSACTION_REQUEST });
  
  try {
    // 1. Получаем данные транзакции перед удалением
    const state = getState();
    const transaction = state.transactions.data.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error('Транзакция не найдена');
    }

    // 2. Удаляем транзакцию с сервера
    await API.delete(`/transactions/${transactionId}`);
    
    // 3. Обновляем баланс счета
    const account = state.accounts.data.find(a => a.id === transaction.accountId);
    if (account) {
      const newBalance = account.balance - transaction.amount; // Упростим вычисление
      await API.patch(`/accounts/${account.id}`, { balance: newBalance });
      
      // Обновляем состояние счета
      dispatch({
        type: UPDATE_ACCOUNT_SUCCESS,
        payload: { ...account, balance: newBalance }
      });
    }

    // 4. Обновляем список транзакций
    dispatch({ 
      type: DELETE_TRANSACTION_SUCCESS,
      payload: transactionId
    });
    
    // 5. Получаем свежие данные (опционально, можно убрать если все обновляется локально)
    dispatch(get_accounts_action(transaction.userId));
    dispatch(get_transactions_action(transaction.userId));
    
  } catch (error) {
    dispatch({
      type: DELETE_TRANSACTION_FAILURE,
      payload: error.message
    });
    throw error;
  }
};