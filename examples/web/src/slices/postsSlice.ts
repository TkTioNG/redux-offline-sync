import { PayloadAction, createSlice } from '@reduxjs/toolkit';

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
  reducers: {
    getPostsActionSuccess: (state: PostsState, action: PayloadAction<any>) => {
      state.postIds = action.payload.postIds;
      state.posts = Object.fromEntries(
        action.payload.posts.map((post: { id: string }) => [post.id, post])
      );
      state.status.posts = 2;
    },
  },
});

const getPostsAction = () => ({
  type: GET_POSTS_REQUESTED,
});

const { getPostsActionSuccess } = postsSlice.actions;

export { getPostsAction, getPostsActionSuccess };

export default postsSlice.reducer;
