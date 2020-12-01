import { fromEvent, of, timer } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  catchError,
  debounceTime,
  exhaustMap,
  filter,
  map,
  mergeMap,
  pluck,
  switchMap,
  tap,
} from "rxjs/operators";

import blogInputEditStore from "../store/blogInputEdit";

export const blogInputEditStream = blogInputEditStore;

export const fetchBlog$ = (postId) => {
  return ajax({ url: "/api/posts/" + postId }).pipe(
    pluck("response", "message"),
    catchError((error) => of({ error }))
  );
};

export const autosave$ = ({ idBloggerUser }) => {
  const editor = document.querySelector(".public-DraftEditor-content");
  return fromEvent(editor, "keydown").pipe(
    filter(
      (e) =>
        e.keyCode !== 18 &&
        e.keyCode !== 17 &&
        (e.keyCode < 33 || e.keyCode > 40) &&
        (e.keyCode < 112 || e.keyCode > 123) &&
        e.keyCode !== 44 &&
        blogInputEditStream.currentState().toggleEditMode &&
        blogInputEditStream.currentState().isAutosaveMode
    ),
    debounceTime(2000),
    filter(() => !blogInputEditStream.currentState().isSaved),
    map(() => {
      let body = { ...blogInputEditStream.currentState().dataBlogPage };
      body.colorStyleMapString = JSON.stringify(
        blogInputEditStream.currentState().colorStyleMap,
      );
      blogInputEditStream.updateData({
        bodySavedString: body.body,
        colorStyleMapSavedString: body.colorStyleMapString
      });
      if (blogInputEditStream.currentState().currentPostIdPath === "create") {
        body.postId = blogInputEditStream.currentState().randomId;
        body.tags = JSON.stringify(
          body.tags.map((tag) => ({
            tagName: typeof tag === "string" ? tag : tag.tagName,
          }))
        );
      }
      body.tags = JSON.stringify(body.tags);
      body.isCompleted = false;
      delete body.updatedAt;
      delete body.user;
      delete body.userId;
      delete body.listImageString;
      delete body.createdAt;
      return body;
    }),
    tap(() => blogInputEditStream.updateData({ isSaving: true })),
    exhaustMap((body) =>
      ajax({
        method: "POST",
        url: "/api/posts",
        headers: { authorization: `Bearer ${idBloggerUser}` },
        body,
      }).pipe(
        pluck("response", "message"),
        catchError((error) => of({ error }))
      )
    )
  );
};

export const triggerSaveData$ = ({ idBloggerUser }) => {
  return timer(0).pipe(
    filter(() => !blogInputEditStream.currentState().isSaved),
    map(() => {
      let body = { ...blogInputEditStream.currentState().dataBlogPage };
      body.colorStyleMapString = JSON.stringify(
        blogInputEditStream.currentState().colorStyleMap
      );
      blogInputEditStream.updateData({
        bodySavedString: body.body,
        colorStyleMapSavedString: body.colorStyleMapString
      });
      if (blogInputEditStream.currentState().currentPostIdPath === "create") {
        body.postId = blogInputEditStream.currentState().randomId;
        body.tags = JSON.stringify(
          body.tags.map((tag) => ({
            tagName: typeof tag === "string" ? tag : tag.tagName,
          }))
        );
      }
      body.tags = JSON.stringify(body.tags);
      body.isCompleted = false;
      delete body.updatedAt;
      delete body.user;
      delete body.userId;
      delete body.listImageString;
      delete body.createdAt;
      return body;
    }),
    tap(() => blogInputEditStream.updateData({ isSaving: true })),
    exhaustMap((body) =>
      ajax({
        method: "POST",
        url: "/api/posts",
        headers: { authorization: `Bearer ${idBloggerUser}` },
        body,
      }).pipe(
        pluck("response", "message"),
        catchError((error) => of({ error }))
      )
    )
  );
};

export const publicizePost$ = (buttonUpload, { idBloggerUser }) => {
  return fromEvent(buttonUpload, "click").pipe(
    filter(() => !blogInputEditStream.currentState().isPublicizing),
    map(() => {
      let body = { ...blogInputEditStream.currentState().dataBlogPage };
      if (blogInputEditStream.currentState().currentPostIdPath === "create") {
        body.postId = blogInputEditStream.currentState().randomId;
        body.tags = JSON.stringify(
          body.tags.map((tag) => ({
            tagName: typeof tag === "string" ? tag : tag.tagName,
          }))
        );
      }
      body.tags = JSON.stringify(body.tags);
      body.isCompleted = true;
      delete body.updatedAt;
      delete body.user;
      delete body.userId;
      delete body.listImageString;
      delete body.createdAt;
      return body;
    }),
    tap(() => blogInputEditStream.updateData({ isPublicizing: true })),
    switchMap((body) =>
      ajax({
        method: "POST",
        url: "/api/posts",
        headers: { authorization: `Bearer ${idBloggerUser}` },
        body,
      }).pipe(
        pluck("response", "message"),
        catchError((error) => of({ error }))
      )
    )
  );
};

export const fetchValidateImageList$ = ({ idBloggerUser }) => {
  return timer(0).pipe(
    map(() => {
      const body = blogInputEditStream.currentState().bodySavedString;
      const postId = blogInputEditStream.currentState().currentPostIdPath;
      return { body, postId };
    }),
    mergeMap((data) =>
      ajax({
        method: "PUT",
        url: "/api/posts/image/" + data.postId,
        headers: { authorization: `Bearer ${idBloggerUser}` },
        body: { body: data.body },
      }).pipe(
        pluck("response", "message"),
        catchError((error) => of({ error }))
      )
    )
  );
};

export const handleColorPickerChange$ = (
  colorPickerInput,
  applyColorInlineStyle,
  editorState,
  onChange
) => {
  return fromEvent(colorPickerInput, "input")
    .pipe(debounceTime(100))
    .subscribe((e) => {
      if (blogInputEditStream.currentState().colorId) {
        const style = blogInputEditStream.currentState().colorId;
        blogInputEditStream.updateData({
          colorStyleMap: {
            ...blogInputEditStream.currentState().colorStyleMap,
            [style]: { color: e.target.value },
          },
        });
        blogInputEditStream.updateCOLORS();
        applyColorInlineStyle(editorState, { style }, onChange)(e);
      }
    });
};
