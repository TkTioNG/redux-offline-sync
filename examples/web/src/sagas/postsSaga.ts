import { takeEvery } from 'redux-saga/effects';
import {
  GET_POSTS_ERROR,
  GET_POSTS_REQUESTED,
  GET_POSTS_SUCCESS,
} from '../slices/postsSlice';
import {
  getOfflineCommitType,
  getOfflineQueueType,
  getOfflineRollbackType,
} from 'redux-offline-sync';

function* getPostsSaga(action: { type: string }) {
  yield console.log(`Called - ${action.type}`);
}

export default function* watchPosts() {
  yield takeEvery(GET_POSTS_REQUESTED, getPostsSaga);
  yield takeEvery(GET_POSTS_SUCCESS, getPostsSaga);
  yield takeEvery(GET_POSTS_ERROR, getPostsSaga);
  yield takeEvery(getOfflineQueueType(GET_POSTS_REQUESTED), getPostsSaga);
  yield takeEvery(getOfflineCommitType(GET_POSTS_REQUESTED), getPostsSaga);
  yield takeEvery(getOfflineRollbackType(GET_POSTS_REQUESTED), getPostsSaga);
}
