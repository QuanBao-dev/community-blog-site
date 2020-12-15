import { fromEvent, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, exhaustMap, map, pluck } from "rxjs/operators";

export const fetchVoteBlog$ = (postId) => {
  return ajax(`/api/posts/${postId}/votes`).pipe(
    pluck("response", "message"),
    catchError((error) =>
      of(error).pipe(
        pluck("response", "error"),
        map((error) => ({ error }))
      )
    )
  );
};
export const upVoteBlog$ = (postId, upVoteButtonElement, { idBloggerUser }) => {
  return fromEvent(upVoteButtonElement, "click").pipe(
    map(() => ({
      isUpVote: true,
    })),
    exhaustMap((body) =>
      ajax({
        method: "PUT",
        url: `/api/posts/${postId}/votes`,
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
export const downVoteBlog$ = (
  postId,
  downVoteButtonElement,
  { idBloggerUser }
) => {
  return fromEvent(downVoteButtonElement, "click").pipe(
    map(() => ({
      isUpVote: false,
    })),
    exhaustMap((body) =>
      ajax({
        method: "PUT",
        url: `/api/posts/${postId}/votes`,
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
