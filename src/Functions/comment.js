import {
  commentStream,
  fetchComments$,
  handleRepliesList$,
  submitComment$,
} from "../epic/comment";

export function handleRepliesList(
  repliesShowElement,
  amountReply,
  parentCommentId
) {
  return () => {
    let subscription;
    if (repliesShowElement)
      subscription = handleRepliesList$(
        repliesShowElement,
        amountReply,
        parentCommentId
      ).subscribe((v) => {
        if (!v.error) {
          const { commentsReply } = v;
          const comments = commentStream.currentState().comments;
          const index = comments.findIndex(
            (comment) => comment.commentId === parentCommentId
          );
          if (
            !commentStream
              .currentState()
              .fetchedCommentId.includes(comments[index].commentId)
          ) {
            const updatedComments = [
              ...comments.slice(0, index + 1),
              ...commentsReply,
              ...comments.slice(index + 1, comments.length),
            ];
            commentStream.updateData({
              comments: updatedComments,
              fetchedCommentId: [
                ...commentStream.currentState().fetchedCommentId,
                parentCommentId,
              ],
            });
            commentStream.updateData({
              triggerCommentUpdated: !commentStream.currentState()
                .triggerCommentUpdated,
            });
          }
        }
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
}

export function updateHandleListPageChange(setListPage, lastPage) {
  return () => {
    setListPage(Array.from(Array(lastPage).keys()));
  };
}

export function fetchComment(postId) {
  return () => {
    const subscription = fetchComments$(postId).subscribe((v) => {
      if (!v.error) {
        const { comments, lastPage } = v;
        commentStream.updateData({
          comments,
          lastPage,
          fetchedCommentId: [],
          isLoading: false,
        });
        commentStream.updateData({
          triggerCommentUpdated: !commentStream.currentState()
            .triggerCommentUpdated,
        });
      }
    });
    return () => {
      commentStream.updateData({ comments: [] });
      subscription.unsubscribe();
    };
  };
}

export function postComment(
  isReply,
  commentId,
  commentLevel,
  button,
  textarea,
  cookies
) {
  return () => {
    let subscription;
    if (button && textarea && cookies) {
      subscription = submitComment$(
        isReply,
        commentId,
        commentLevel,
        button,
        textarea,
        cookies
      ).subscribe((v) => {
        if (!v.error) {
          if (!isReply) {
            if (commentStream.currentState().page === 1) {
              const { comments } = commentStream.currentState();
              comments.unshift(v.comment);
              comments.pop();
              commentStream.updateData({
                comments,
                lastPage: v.lastPage,
              });
            } else
              commentStream.updateData({
                page: 1,
              });
          } else {
            const { fetchedCommentId, comments } = commentStream.currentState();
            const index = comments.findIndex(
              (comment) => comment.commentId === commentId
            );
            if (!comments[index].amountReply) comments[index].amountReply = 0;
            comments[index].amountReply += 1;
            const updatedComments = [
              ...comments.slice(0, index + 1),
              ...v.commentsReply,
              ...comments.slice(index + 1, comments.length),
            ];
            fetchedCommentId.push(commentId);
            commentStream.updateData({
              comments: updatedComments,
              fetchedCommentId,
            });
          }
        }
        textarea.value = "";
      });
    }
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
}

export function initCommentState(setState) {
  return () => {
    const subscription = commentStream.subscribe(setState);
    return () => {
      subscription.unsubscribe();
      commentStream.updateData({ comments: [] });
    };
  };
}
