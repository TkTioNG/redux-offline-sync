import { all, fork } from 'redux-saga/effects';
import watchOrders from './ordersSaga';
import watchPosts from './postsSaga';

export default function* rootSaga() {
  yield all([fork(watchOrders), fork(watchPosts)]);
}
