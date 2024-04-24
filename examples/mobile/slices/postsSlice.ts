import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';
import { OfflineAction, OfflineResultMeta } from 'redux-offline-sync/src/types';
import uuid from 'react-native-uuid';

export interface PostsState {
  postIds: string[];
  posts: Record<string, any>;
  status: {
    posts: number;
  };
  refreshKey: string | null;
  lastKeyTimestamp: number | null;
}

const initialState: PostsState = {
  postIds: [],
  posts: {},
  status: {
    posts: 0,
  },
  refreshKey: null,
  lastKeyTimestamp: null,
};

const POSTS = 'posts';
const PREFIX = `${POSTS}/`;
export type POSTS = typeof POSTS;

const GET_POSTS = 'getPostsAction';
const GET_POSTS_REQUESTED = `${GET_POSTS}Requested`;
const GET_POSTS_SUCCESS = `${GET_POSTS}Success`;
const GET_POSTS_ERROR = `${GET_POSTS}Error`;

const UPDATE_REFRESH_KEY = 'updateRefreshKey';
const UPDATE_REFRESH_KEY_REQUESTED = `${UPDATE_REFRESH_KEY}Requested`;
const UPDATE_REFRESH_KEY_SUCCESS = `${UPDATE_REFRESH_KEY}Success`;

export const POSTS_GET_POSTS_REQUESTED = `${PREFIX}${GET_POSTS_REQUESTED}`;
export const POSTS_GET_POSTS_SUCCESS = `${PREFIX}${GET_POSTS_SUCCESS}`;
export const POSTS_GET_POSTS_ERROR = `${PREFIX}${GET_POSTS_ERROR}`;
export const POSTS_UPDATE_REFRESH_KEY_REQUESTED = `${PREFIX}${UPDATE_REFRESH_KEY_REQUESTED}`;
export const POSTS_UPDATE_REFRESH_KEY_SUCCESS = `${PREFIX}${UPDATE_REFRESH_KEY_SUCCESS}`;

const postsSlice = createSlice({
  name: POSTS,
  initialState: initialState,
  reducers: (create) => ({
    [GET_POSTS_SUCCESS]: create.reducer(
      // @ts-expect-error ignore it
      (
        state,
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
    [UPDATE_REFRESH_KEY_SUCCESS]: create.reducer(
      (
        state,
        action: PayloadAction<{ refreshKey: string; lastKeyTimestamp: number }>
      ) => {
        state.refreshKey = action.payload.refreshKey;
        state.lastKeyTimestamp = action.payload.lastKeyTimestamp;
      }
    ),
  }),
  selectors: {
    selectRefreshKey: (state) => state.refreshKey,
    selectLastKeyTimestamp: (state) => state.lastKeyTimestamp,
  },
});

const getPostsAction = (type: number): OfflineAction => {
  let url = 'http://localhost:4000/succeed-always/?slow=true';
  if (type === 1) {
    url = 'http://localhost:4000/succeed-sometimes/?slow=true';
  } else if (type === 2) {
    url = 'http://localhost:4000/fail-sometimes/?slow=true';
  }
  return {
    type: POSTS_GET_POSTS_REQUESTED,
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

const updateRefreshKey = createAction(
  POSTS_UPDATE_REFRESH_KEY_REQUESTED,
  () => ({
    payload: {
      refreshKey: uuid.v4(),
    },
  })
);

const { getPostsActionSuccess, updateRefreshKeySuccess } = postsSlice.actions;
const { selectRefreshKey, selectLastKeyTimestamp } = postsSlice.selectors;

export {
  getPostsAction,
  getPostsActionSuccess,
  updateRefreshKey,
  updateRefreshKeySuccess,
  selectRefreshKey,
  selectLastKeyTimestamp,
};

export default postsSlice.reducer;
