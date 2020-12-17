import { useEffect } from "react";
import { blogInputEditStream } from "../epic/blogInputEdit";

import {
  autosave,
  checkPageSaved,
  colorPickerChange,
  fetchBlogData,
  initBlogDetail,
  initEditorContent,
  publishPost,
  saveTrigger,
  showHidePublish,
  showHideSaving,
  toggleEdit,
  updateAfterFetch,
} from "../Functions/blogInputEdit";

export function useInitBlogDetail(onChange, decorator, setBlogState) {
  const { currentPostIdPath } = blogInputEditStream.currentState();
  useEffect(initBlogDetail(onChange, decorator, setBlogState), [
    currentPostIdPath,
  ]);
}

export function useInitEditorContent(
  postId,
  blogState,
  cookies,
  onChange,
  convertFromRaw,
  decorator
) {
  useEffect(
    initEditorContent(
      postId,
      blogState,
      cookies,
      onChange,
      convertFromRaw,
      decorator
    ),
    [blogState.dataBlogPage.title]
  );
}

export function useFetchBlogData(
  { triggerFetchBlog },
  postId,
  onChange,
  history,
  decorator
) {
  useEffect(fetchBlogData(postId, onChange, decorator, history), [
    postId,
    triggerFetchBlog,
  ]);
}

export const usePublishPost = (buttonUpload, cookies, history, postId) => {
  useEffect(publishPost(buttonUpload, cookies, history), [
    buttonUpload,
    postId,
  ]);
};
export const useSaveTrigger = (cookies, blogState, history) => {
  useEffect(saveTrigger(cookies, history), [blogState.triggerSave]);
};

export const useAutoSave = (cookies, history) => {
  useEffect(autosave(cookies, history), [cookies]);
};

export function useColorPickerChange(
  colorPickerInput,
  editorState,
  onChange,
) {
  useEffect(
    colorPickerChange(
      colorPickerInput,
      editorState,
      onChange
    ),
    [colorPickerInput, editorState]
  );
}

export function useCheckPageSaved(blogState, editorState) {
  useEffect(checkPageSaved(blogState), [
    blogState.bodySavedString,
    blogState.colorStyleMap,
    blogState.colorStyleMapSavedString,
    blogState.dataBlogPage.body,
    editorState,
  ]);
}

export function useUpdateAfterFetch(editorState, onChange, blogState) {
  useEffect(updateAfterFetch(editorState, onChange), [
    blogState.listImageString,
    editorState,
  ]);
}

export function useShowHideSaving(blogState) {
  useEffect(showHideSaving(blogState), [blogState.isSaving]);
}

export function useShowHidePublish(blogState) {
  useEffect(showHidePublish(blogState), [blogState.isPublicizing]);
}

export function useToggleEdit(blogState) {
  useEffect(toggleEdit(blogState), [blogState.toggleEditMode]);
}
