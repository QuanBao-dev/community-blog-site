import { useEffect } from "react";

import { commentStream } from "../epic/comment";
import {
  deleteComment,
  fetchComment,
  handleListPageChange,
  handleRepliesList,
  initCommentState,
  likeComment,
  postComment,
} from "../Functions/comment";

export const useInitComment = (setState) => {
  useEffect(initCommentState(setState), []);
};

export const usePostComment = (
  isReply,
  commentId,
  commentLevel,
  button,
  textarea,
  cookies,
  setToggleReply
) => {
  useEffect(
    postComment(
      isReply,
      commentId,
      commentLevel,
      button.current,
      textarea.current,
      cookies,
      setToggleReply
    ),
    [cookies, button.current, textarea.current]
  );
};

export const useFetchComment = (postId, page) => {
  useEffect(fetchComment(postId), [postId, page]);
};

export const useHandleListPageChange = (lastPage, setListPage) => {
  useEffect(handleListPageChange(setListPage, lastPage), [lastPage]);
};

export const useLikeComment = (buttonLike, user, commentId, cookies) => {
  useEffect(likeComment(buttonLike.current, user, commentId, cookies), [
    buttonLike.current,
    user,
  ]);
};

export const useDeleteComment = (buttonDelete, commentId, cookies) => {
  const { triggerCommentUpdated } = commentStream.currentState();
  useEffect(deleteComment(buttonDelete.current, commentId, cookies), [
    buttonDelete.current,
    triggerCommentUpdated,
  ]);
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
