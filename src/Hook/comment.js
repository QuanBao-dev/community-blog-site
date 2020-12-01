import { useEffect } from "react";

import {
  fetchComment,
  handleRepliesList,
  initCommentState,
  postComment,
  updateHandleListPageChange,
} from "../Functions/comment";
import { commentStream } from "../epic/comment";

export const useInitComment = (setState) => {
  useEffect(initCommentState(setState), []);
};

export const usePostComment = (
  isReply,
  commentId,
  commentLevel,
  button,
  textarea,
  cookies
) => {
  useEffect(
    postComment(
      isReply,
      commentId,
      commentLevel,
      button.current,
      textarea.current,
      cookies
    ),
    [cookies, button.current, textarea.current]
  );
};

export const useFetchComment = (postId, page) => {
  useEffect(fetchComment(postId), [postId, page]);
};

export const useHandleListPageChange = (lastPage, setListPage) => {
  useEffect(updateHandleListPageChange(setListPage, lastPage), [lastPage]);
};

export const useHandleRepliesList = (
  repliesShowRef,
  amountReply,
  parentCommentId
) => {
  const { triggerCommentUpdated } = commentStream.currentState();
  useEffect(
    handleRepliesList(repliesShowRef.current, amountReply, parentCommentId),
    [repliesShowRef.current, triggerCommentUpdated]
  );
};
