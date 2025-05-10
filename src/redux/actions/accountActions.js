// src/redux/actions/accountActions.js
import API from '../../api/api';
import {
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_FAILURE,
} from '../types';

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
  }
};