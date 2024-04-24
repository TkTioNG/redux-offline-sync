import { PayloadAction } from '@reduxjs/toolkit';
import { takeEvery } from 'redux-saga/effects';
import { GET_ORDERS_REQUESTED } from '../slices/ordersSlice';

function* getOrdersSaga(action: PayloadAction<any>) {
  console.log('getOrdersSaga');
  console.log(action);
  yield console.log(action);
}

export default function* watchOrders() {
  yield takeEvery(GET_ORDERS_REQUESTED, getOrdersSaga);
}
