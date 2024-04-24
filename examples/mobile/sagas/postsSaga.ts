import { put, takeEvery } from 'redux-saga/effects';
import {
  POSTS_GET_POSTS_ERROR,
  POSTS_GET_POSTS_REQUESTED,
  POSTS_GET_POSTS_SUCCESS,
  POSTS_UPDATE_REFRESH_KEY_REQUESTED,
  updateRefreshKeySuccess,
} from '../slices/postsSlice';
import {
  getOfflineCommitType,
  getOfflineQueueType,
  getOfflineRollbackType,
} from 'redux-offline-sync';
import { PayloadAction } from '@reduxjs/toolkit';

function* getPostsSaga(action: { type: string }) {
  yield console.log(`Called - ${action.type}`);
}

function* updateRequestKey(action: PayloadAction<{ refreshKey: string }>) {
  yield put(
    updateRefreshKeySuccess({
      refreshKey: action.payload.refreshKey,
      lastKeyTimestamp: Date.now(),
    })
  );
}

export default function* watchPosts() {
  yield takeEvery(POSTS_GET_POSTS_REQUESTED, getPostsSaga);
  yield takeEvery(POSTS_GET_POSTS_SUCCESS, getPostsSaga);
  yield takeEvery(POSTS_GET_POSTS_ERROR, getPostsSaga);
  yield takeEvery(getOfflineQueueType(POSTS_GET_POSTS_REQUESTED), getPostsSaga);
  yield takeEvery(
    getOfflineCommitType(POSTS_GET_POSTS_REQUESTED),
    getPostsSaga
  );
  yield takeEvery(
    getOfflineRollbackType(POSTS_GET_POSTS_REQUESTED),
    getPostsSaga
  );
  yield takeEvery(POSTS_UPDATE_REFRESH_KEY_REQUESTED, updateRequestKey);
}
