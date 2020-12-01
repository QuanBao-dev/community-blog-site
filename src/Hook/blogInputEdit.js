import { useEffect } from 'react';

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
} from '../Functions/blogInputEdit';

export function useInitBlogDetail(setBlogState, cookies) {
  useEffect(initBlogDetail(setBlogState, cookies), []);
}

export function useInitEditorContent(
  blogState,
  cookies,
  onChange,
  convertFromRaw,
  decorator
) {
  useEffect(
    initEditorContent(blogState, cookies, onChange, convertFromRaw, decorator),
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

export const usePublishPost = (buttonUpload, cookies) => {
  useEffect(publishPost(buttonUpload, cookies), [buttonUpload, cookies]);
};
export const useSaveTrigger = (cookies, blogState) => {
  useEffect(saveTrigger(cookies), [blogState.triggerSave, cookies]);
};

export const useAutoSave = (cookies) => {
  useEffect(autosave(cookies), [cookies]);
};

export function useColorPickerChange(
  colorPickerInput,
  editorState,
  onChange,
  applyColorInlineStyle
) {
  useEffect(
    colorPickerChange(
      colorPickerInput,
      applyColorInlineStyle,
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
