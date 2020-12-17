import { fromEvent, of, timer } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, exhaustMap, filter, map, mergeMapTo, pluck, switchMap, takeWhile, tap } from 'rxjs/operators';

import listPostStore from '../store/listPost';

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
    url = `/api/posts/user/${userId}?page=${
      listPostStream.currentState().currentPage
    }`;
  } else if (title) {
    url = `/api/posts/${title}/search?page=${
      listPostStream.currentState().currentPage
    }`;
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

export const createEditPost$ = (
  buttonSubmitElement,
  titleElement,
  introElement,
  boardEditElement,
  dataSend,
  tagElement,
  tabMode,
  post,
  cookies
) => {
  return fromEvent(buttonSubmitElement, "click").pipe(
    map(() => ({
      title: titleElement.value,
      excerpt: introElement.value,
      tags: JSON.stringify(dataSend),
      isCompleted: tabMode === 3 ? false : true,
    })),
    tap(() => {
      boardEditElement.style.display = "none";
      titleElement.value = "";
      introElement.value = "";
      tagElement.value = "";
    }),
    switchMap((body) =>
      ajax({
        url: "/api/posts/" + post.postId,
        method: "PUT",
        headers: {
          authorization: `Bearer ${cookies.idBloggerUser}`,
        },
        body,
      }).pipe(
        pluck("response", "message"),
        catchError((error) =>
          of(error).pipe(
            pluck("response", "error"),
            map((error) => ({ error }))
          )
        )
      )
    )
  );
};

export const erasePost$ = (eraseButtonElement, post, cookies) => {
  return fromEvent(eraseButtonElement, "click").pipe(
    exhaustMap(() =>
      ajax({
        url: "/api/posts/" + post.postId,
        method: "DELETE",
        headers: {
          authorization: `Bearer ${cookies.idBloggerUser}`,
        },
      }).pipe(
        pluck("response", "message"),
        catchError((error) =>
          of(error).pipe(
            pluck("response", "error"),
            map((error) => ({ error }))
          )
        )
      )
    )
  );
};

export const showEditPostForm$ = (editButtonElement) => {
  return fromEvent(editButtonElement, "click");
};
