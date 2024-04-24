import { combineReducers } from 'redux';
import orderReducer from './ordersSlice';
import postReducer from './postsSlice';

const rootReducer = combineReducers({
  orders: orderReducer,
  posts: postReducer,
});

export default rootReducer;
