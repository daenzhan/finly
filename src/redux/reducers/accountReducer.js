// src/redux/reducers/accountReducer.js
import {
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_FAILURE,
  UPDATE_ACCOUNT_SUCCESS,
  ADD_ACCOUNT_SUCCESS,
} from '../types';

const initialState = {
  data: [],
  loading: false,
  error: null,
};

export const accountReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACCOUNTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ACCOUNTS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_ACCOUNTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ADD_ACCOUNT_SUCCESS:
      return {
          ...state,
          data: [...state.data, action.payload],
          loading: false
      };
    case UPDATE_ACCOUNT_SUCCESS:
      return {
        ...state,
        data: state.data.map(acc =>
          acc.id === action.payload.id ? action.payload : acc
        ),
      };
    default:
      return state;
  }
};
export default accountReducer;