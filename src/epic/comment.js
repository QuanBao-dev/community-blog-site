import { fromEvent, iif, of, timer } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMapTo,
  pluck,
  switchMap,
  tap,
} from "rxjs/operators";

import commentStore from "../store/comment";
import { blogInputEditStream } from "./blogInputEdit";
import { userStream } from "./user";

export const commentStream = commentStore;

export const fetchComments$ = (postId) => {
  return timer(0).pipe(
    tap(() => commentStream.updateData({ isLoading: true })),
    mergeMapTo(
      ajax(
        `/api/comments/post/${postId}?page=${commentStream.currentState().page}`
      ).pipe(
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

export const submitComment$ = (
  isReply,
  commentId,
  commentLevel,
  button,
  textarea,
  { idBloggerUser }
) => {
  return timer(0).pipe(
    mergeMapTo(
      iif(
        () => !isReply,
        fromEvent(button, "click").pipe(
          filter(
            () => textarea.value.trim() !== "" && userStream.currentState().user
          ),
          map(() => ({
            postId: blogInputEditStream.currentState().currentPostIdPath,
            content: textarea.value,
            isAuthor:
              blogInputEditStream.currentState().dataBlogPage.user.userId ===
              userStream.currentState().user.userId,
          })),
          exhaustMap((body) =>
            ajax({
              method: "POST",
              url: "/api/comments",
              headers: {
                authorization: `Bearer ${idBloggerUser}`,
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
        ),
        fromEvent(button, "click").pipe(
          map(() => ({
            postId: blogInputEditStream.currentState().currentPostIdPath,
            content: textarea.value,
            parentCommentId: commentId,
            parentLevel: commentLevel,
            isAuthor:
              blogInputEditStream.currentState().dataBlogPage.user.userId ===
              userStream.currentState().user.userId,
          })),
          exhaustMap((body) =>
            ajax({
              method: "POST",
              url: "/api/comments",
              headers: {
                authorization: `Bearer ${idBloggerUser}`,
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
        )
      )
    )
  );
};

export const handleRepliesList$ = (repliesE, amountReply, parentCommentId) => {
  return fromEvent(repliesE, "click").pipe(
    filter(() => amountReply > 0),
    filter(() => {
      return !commentStream
        .currentState()
        .fetchedCommentId.includes(parentCommentId);
    }),
    switchMap(() =>
      ajax(
        `/api/comments/post/${
          blogInputEditStream.currentState().currentPostIdPath
        }?parentCommentId=${parentCommentId}`
      ).pipe(
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

export const likeComment$ = (buttonE, user, commentId, { idBloggerUser }) => {
  return fromEvent(buttonE, "click").pipe(
    map(() => ({
      userId: user.userId,
    })),
    exhaustMap((body) =>
      ajax({
        method: "PUT",
        url: `/api/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${idBloggerUser}`,
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

export const deleteComment$ = (buttonE, commentId, { idBloggerUser }) => {
  return fromEvent(buttonE, "click").pipe(
    exhaustMap(() =>
      ajax({
        method: "DELETE",
        url: `/api/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${idBloggerUser}`,
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
