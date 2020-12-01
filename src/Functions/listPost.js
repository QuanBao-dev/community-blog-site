import {
  fetchPosts$,
  listPostStream,
  updateDataWhenScrollingToBottom$,
} from "../epic/listPost";
import { tabBarStream } from "../epic/tabBar";

export const initListPost = (setListPostState, setTabBarState) => {
  return () => {
    const subscription = listPostStream.subscribe(setListPostState);
    const subTabBar = tabBarStream.subscribe(setTabBarState);
    if (
      listPostStream.currentState().currentPage !==
      listPostStream.currentState().latestPageFetched
    ) {
      listPostStream.updateData({
        currentPage: 1,
        isStillFetchingWhenScrolling: false,
        isStopFetching: false,
        latestPageFetched: null,
        listPost: [],
        latestTabMode: tabBarStream.currentState().tabMode,
      });
    }
    return () => {
      subscription.unsubscribe();
      subTabBar.unsubscribe();
    };
  };
};

export function updateParams(tagId, title, userId) {
  return () => {
    listPostStream.updateData({ tagId, title, userId });
  };
}

export function stopFetch(listPostState) {
  return () => {
    if (
      listPostState.listPost.length % 5 !== 0 &&
      listPostState.listPost.length !== 0
    ) {
      listPostStream.updateData({
        isStopFetching: true,
        isStillFetchingWhenScrolling: false,
      });
    } else {
      listPostStream.updateData({
        isStillFetchingWhenScrolling: true,
        isStopFetching: false,
      });
    }
  };
}

export const resetTabBar = (tabBarState, listPostState) => {
  return () => {
    if (
      tabBarState.tabMode !== listPostStream.currentState().latestTabMode ||
      listPostState.tagId !== listPostStream.currentState().latestTagId ||
      listPostState.userId !== listPostStream.currentState().latestUserId ||
      listPostState.title !== listPostStream.currentState().latestTitle
    )
      listPostStream.updateData({
        currentPage: 1,
        isStillFetchingWhenScrolling: false,
        isStopFetching: false,
        latestPageFetched: null,
        listPost: [],
        latestTabMode: tabBarStream.currentState().tabMode,
      });
  };
};

export const updateDataListPost = (
  listPostState,
  tabBarState,
  cookie,
  title,
  tagId,
  userId
) => {
  return () => {
    let subscription;
    if (
      !listPostStream.currentState().isStopFetching &&
      listPostStream.currentState().latestPageFetched !==
        listPostState.currentPage
    )
      subscription = fetchPosts$(
        tabBarState.tabMode,
        cookie,
        listPostState.tagId,
        listPostState.title,
        listPostState.userId
      ).subscribe((data) => {
        const updatedData = [
          ...listPostStream.currentState().listPost,
          ...data,
        ];
        if (data.length === 0) {
          listPostStream.updateData({
            isStopFetching: true,
            isStillFetchingWhenScrolling: false,
          });
        }
        listPostStream.updateData({
          listPost: updatedData,
          latestTagId: tagId,
          latestPageFetched: listPostState.currentPage,
          latestTabMode: tabBarState.tabMode,
          latestUserId: userId,
          latestTitle: title,
        });
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };
};

export const updatePageScrolling = (listPostState, quantityPost) => {
  return () => {
    let subscription;
    if (listPostState.isStillFetchingWhenScrolling)
      subscription = updateDataWhenScrollingToBottom$().subscribe(() => {
        listPostStream.updateData({
          currentPage:
            parseInt(
              listPostStream.currentState().listPost.length / quantityPost
            ) + 1,
        });
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
};
