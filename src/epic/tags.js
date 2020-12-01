import tagStore from "../store/tags";
import { ajax } from "rxjs/ajax";
import { catchError, pluck } from "rxjs/operators";
import { of } from "rxjs";
export const tagStream = tagStore;

export const fetchTags$ = () => {
  return ajax("/api/tags?page=" + tagStream.currentState().currentPage).pipe(
    pluck("response", "message"),
    catchError((error) => of({error}))
  );
};

export const fetchPostsTag$ = (tagId) => {
  return ajax("/api/tags/" + tagId + "/posts").pipe(
    pluck("response", "message"),
    catchError((error) => of({error}))
  );
};
