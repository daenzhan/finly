// src/redux/reducers/categoryReducer.js
import {
    FETCH_CATEGORIES_REQUEST,
    FETCH_CATEGORIES_SUCCESS,
    FETCH_CATEGORIES_FAILURE,
    ADD_CATEGORY_SUCCESS,
    DELETE_CATEGORY_SUCCESS,
  } from '../types';
  
  const initialState = {
    data: [],
    loading: false,
    error: null,
  };
  
  const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CATEGORIES_REQUEST:
        return { ...state, loading: true, error: null };
      case FETCH_CATEGORIES_SUCCESS:
        return { ...state, loading: false, data: action.payload };
      case FETCH_CATEGORIES_FAILURE:
        return { ...state, loading: false, error: action.payload };
      case ADD_CATEGORY_SUCCESS:
        return { ...state, data: [...state.data, action.payload] };
        case DELETE_CATEGORY_SUCCESS:
            return {
              ...state,
              loading: false,
              data: state.data.filter(cat => cat.id !== action.payload)
            };
      default:
        return state;
    }
  };
  
  export default categoryReducer;