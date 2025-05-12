// src/redux/reducers/transactionReducer.js
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
  ADD_TRANSACTION_SUCCESS,
  UPDATE_TRANSACTION_SUCCESS,
  DELETE_TRANSACTION_SUCCESS,
} from '../types';   

const initialState = {
  data: [],
  loading: false,
  error: null,
};

export const transactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_TRANSACTIONS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_TRANSACTIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ADD_TRANSACTION_SUCCESS:
      return {
        ...state,
        data: [...state.data, action.payload],
      };
    case UPDATE_TRANSACTION_SUCCESS:
       return {
       ...state,
      loading: false,
      data: state.data.map(tx => 
      tx.id === action.payload.id ? action.payload : tx
    )
  };
  case DELETE_TRANSACTION_SUCCESS:
  return {
    ...state,
    loading: false,
    data: state.data.filter(tx => tx.id !== action.payload)
  };
    default:
      return state;
  }
};
export default transactionReducer;