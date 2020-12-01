import { fromEvent, timer } from "rxjs";
import { ajax } from "rxjs/ajax";
import { filter, mergeMapTo, pluck, takeWhile, tap } from "rxjs/operators";

import listPostStore from "../store/listPost";

export const listPostStream = listPostStore;

export const fetchPosts$ = (
  tabMode,
  { idBloggerUser },
  tagId,
  title,
  userId
) => {
  let url;
  if (userId) {
    url = `/api/posts/user/${userId}`;
  } else if (title) {
    url = `/api/posts/${title}/search`;
  } else if (tagId) {
    url = `/api/tags/${tagId}/posts?page=${
      listPostStream.currentState().currentPage
    }`;
  } else if (tabMode === 1) {
    url = `/api/posts?page=${listPostStream.currentState().currentPage}`;
  } else if (tabMode === 2) {
    url = `/api/posts/personal?page=${
      listPostStream.currentState().currentPage
    }`;
  } else {
    url = `/api/posts/personal?isCompleted=false&page=${
      listPostStream.currentState().currentPage
    }`;
  }
  const headers = {
    authorization: `Bearer ${idBloggerUser}`,
  };
  let request = {
    url,
  };
  if (tabMode !== 1)
    request = {
      ...request,
      headers,
    };
  return timer(0).pipe(
    tap(() =>
      listPostStream.updateData({ isStillFetchingWhenScrolling: false })
    ),
    mergeMapTo(
      ajax(request).pipe(
        takeWhile(() => !listPostStream.currentState().isStopFetching),
        pluck("response", "message")
      )
    )
  );
};

export const updateDataWhenScrollingToBottom$ = () => {
  return fromEvent(document, "scroll").pipe(
    takeWhile(() => !listPostStream.currentState().isStopFetching),
    filter(() => document.body.scrollHeight - (window.scrollY + 1500) < 0)
  );
};
