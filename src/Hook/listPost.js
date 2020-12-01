import { useEffect } from 'react';

import {
  initListPost,
  resetTabBar,
  stopFetch,
  updateDataListPost,
  updatePageScrolling,
  updateParams,
} from '../Functions/listPost';
const quantityPost = 5;

export function useInitListPost(setListPostState, setTabBarState) {
  useEffect(initListPost(setListPostState, setTabBarState), []);
}

export function useUpdateParams(tagId, title, userId) {
  useEffect(updateParams(tagId, title, userId), [tagId, title, userId]);
}

export function useStopFetch(listPostState) {
  useEffect(stopFetch(listPostState), [listPostState.listPost.length]);
}

export function useUpdatePageScrolling(listPostState) {
  useEffect(updatePageScrolling(listPostState, quantityPost), [
    listPostState.isStillFetchingWhenScrolling,
  ]);
}

export function useUpdateDataListPost(
  listPostState,
  tabBarState,
  cookie,
  title,
  tagId,
  userId
) {
  useEffect(
    updateDataListPost(
      listPostState,
      tabBarState,
      cookie,
      title,
      tagId,
      userId
    ),
    [
      listPostState.currentPage,
      tabBarState.tabMode,
      listPostState.tagId,
      listPostState.title,
      listPostState.userId,
      listPostState.isStopFetching,
      listPostState.latestPageFetched,
    ]
  );
}

export function useResetTabBar(tabBarState, listPostState) {
  useEffect(resetTabBar(tabBarState, listPostState), [
    tabBarState.tabMode,
    listPostState.tagId,
    listPostState.userId,
    listPostState.title,
  ]);
}
