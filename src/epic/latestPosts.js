import { iif, of, timer } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, filter, map, mergeMapTo, pluck } from "rxjs/operators";

import latestPostsStore from "../store/latestPosts";

export const latestPostsStream = latestPostsStore;
export const fetchLatestPosts$ = (isAuthor) => {
  return timer(0).pipe(
    mergeMapTo(
      iif(
        () => !isAuthor,
        timer(0).pipe(
          filter(() => latestPostsStream.currentState().shouldFetchLatestPost),
          mergeMapTo(
            ajax("/api/posts?page=1").pipe(
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
        timer(0).pipe(
          filter(
            () =>
              latestPostsStream.currentState().shouldFetchLatestPostAuthor &&
              latestPostsStream.currentState().authorId !==
                latestPostsStream.currentState().previousAuthorId
          ),
          filter(() => latestPostsStream.currentState().authorId),
          mergeMapTo(
            ajax(
              "/api/posts?page=1&authorId=" +
                latestPostsStream.currentState().authorId
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
        )
      )
    )
  );
};
