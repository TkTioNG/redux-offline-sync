import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeEvery } from 'redux-saga/effects';
import {
  GET_POSTS_REQUESTED,
  getPostsActionSuccess,
} from '../slices/postsSlice';

// function* getPostsSaga(action: PayloadAction<any>) {
//   console.log(action);
//   const posts = [{ id: 1, message: 'banana' }];
//   const postIds = posts.map((post) => post.id);
//   yield put(
//     getPostsActionSuccess({ postIds, posts: [{ id: 1, message: 'banana' }] })
//   );
// }

export default function* watchPosts() {
  yield takeEvery(GET_POSTS_REQUESTED, getPostsSaga);
}
