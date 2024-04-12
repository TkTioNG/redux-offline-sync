import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { OfflineAction, OfflineResultMeta } from 'redux-offline-sync/src/types';

export interface PostsState {
  postIds: string[];
  posts: Record<string, any>;
  status: {
    posts: number;
  };
}

const initialState: PostsState = {
  postIds: [],
  posts: {},
  status: {
    posts: 0,
  },
};

const POSTS = 'posts';
export type POSTS = typeof POSTS;
export const GET_POSTS = `${POSTS}/getPostsAction`;
export const GET_POSTS_REQUESTED = `${GET_POSTS}Requested`;
export const GET_POSTS_SUCCESS = `${GET_POSTS}Success`;
export const GET_POSTS_ERROR = `${GET_POSTS}Error`;

const postsSlice = createSlice({
  name: POSTS,
  initialState: initialState,
  reducers: (create) => ({
    getPostsActionSuccess: create.reducer(
      // @ts-expect-error ignore it
      (
        state: PostsState,
        action: PayloadAction<any, string, { offlineSync: OfflineResultMeta }>
      ) => {
        const syncUuid = action.meta.offlineSync.syncUuid;
        state.postIds = [...state.postIds, syncUuid];
        state.posts = {
          ...state.posts,
          [syncUuid]: {
            ...action.payload,
            id: syncUuid,
          },
        };
        state.status.posts = 2;
      }
    ),
  }),
});

const getPostsAction = (type: number): OfflineAction => {
  let url = 'http://localhost:4000/succeed-always/?slow=true';
  if (type === 1) {
    url = 'http://localhost:4000/succeed-sometimes/?slow=true';
  } else if (type === 2) {
    url = 'http://localhost:4000/fail-sometimes/?slow=true';
  }
  return {
    type: GET_POSTS_REQUESTED,
    meta: {
      offlineSync: {
        effect: {
          url,
        },
        commit: GET_POSTS_SUCCESS,
      },
    },
  };
};

const { getPostsActionSuccess } = postsSlice.actions;

export { getPostsAction, getPostsActionSuccess };

export default postsSlice.reducer;
