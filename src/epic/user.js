import { from, fromEvent, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  catchError,
  filter,
  map,
  mergeMap,
  pluck,
  switchMap,
} from "rxjs/operators";

import userStore from "../store/user";

export const userStream = userStore;

export const fetchUser$ = ({ idBloggerUser }) => {
  return ajax({
    url: "/api",
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
  );
};

export const submitForm$ = (
  buttonSubmit,
  bodyRef,
  url,
  method = "POST",
  cookies
) => {
  let headers = {};
  if (cookies) {
    headers = {
      authorization: `Bearer ${cookies.idBloggerUser}`,
    };
  }
  return fromEvent(buttonSubmit, "click").pipe(
    map(() =>
      Object.keys(bodyRef).reduce((ans, key) => {
        ans[key] = bodyRef[key].value;
        return ans;
      }, {})
    ),
    switchMap((body) =>
      ajax({
        method,
        url,
        body,
        headers,
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

export const submitFormWithEnter$ = (inputList, bodyRef, url) => {
  return from(inputList).pipe(
    mergeMap((input) =>
      fromEvent(input, "keydown").pipe(
        filter((e) => e.keyCode === 13),
        map(() =>
          Object.keys(bodyRef).reduce((ans, key) => {
            ans[key] = bodyRef[key].value;
            return ans;
          }, {})
        ),
        switchMap((body) =>
          ajax({
            method: "POST",
            url,
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
  );
};

export const logoutUser$ = ({ idBloggerUser }) => {
  return ajax({
    url: "/api/users/logout",
    method: "DELETE",
    headers: {
      authorization: `Bearer ${idBloggerUser}`,
    },
  });
};
