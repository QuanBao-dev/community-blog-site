import { of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, filter, pluck } from "rxjs/operators";

import latestPostsStore from "../store/latestPosts";

export const latestPostsStream = latestPostsStore;
export const fetchLatestPosts$ = () => {
  return ajax("/api/posts?page=1").pipe(
    pluck("response", "message"),
    filter(() => latestPostsStream.currentState().shouldFetchLatestPost),
    catchError((error) => of(error))
  );
};
