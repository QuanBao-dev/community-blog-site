import {
  commentStream,
  deleteComment$,
  fetchComments$,
  handleRepliesList$,
  likeComment$,
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

export function handleListPageChange(setListPage, lastPage) {
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
  cookies,
  setToggleReply
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
              let { comments } = commentStream.currentState();
              comments.unshift(v.comment);
              comments = comments.filter((comment) => comment.childLevel === 0);
              if (comments.length > 6) comments.pop();
              commentStream.updateData({
                comments,
                fetchedCommentId: [],
                lastPage: v.lastPage,
              });
            } else
              commentStream.updateData({
                page: 1,
              });
          } else {
            let { fetchedCommentId, comments } = commentStream.currentState();
            const index = comments.findIndex(
              (comment) => comment.commentId === commentId
            );
            if (!comments[index].amountReply) comments[index].amountReply = 0;
            comments[index].amountReply += 1;
            let updatedComments;
            if (!fetchedCommentId.includes(commentId)) {
              updatedComments = [
                ...comments.slice(0, index + 1),
                ...v.commentsReply,
                ...comments.slice(index + 1, comments.length),
              ];
              fetchedCommentId.push(commentId);
            } else {
              updatedComments = [
                ...comments.slice(0, index + 1),
                v.comment,
                ...comments.slice(index + 1, comments.length),
              ];
            }
            commentStream.updateData({
              comments: updatedComments,
              fetchedCommentId,
            });
          }
          commentStream.updateData({
            triggerCommentUpdated: !commentStream.currentState()
              .triggerCommentUpdated,
          });
        }
        setToggleReply(false);
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
      commentStream.updateData({ comments: [], page: 1 });
    };
  };
}

export const likeComment = (buttonE, user, commentId, cookies) => {
  return () => {
    let subscription;
    if (buttonE)
      subscription = likeComment$(buttonE, user, commentId, cookies).subscribe(
        (v) => {
          const { userIdLikes, quantityLikes } = v;
          let { comments } = commentStream.currentState();
          const index = comments.findIndex(
            (comment) => comment.commentId === commentId
          );
          comments[index].quantityLikes = quantityLikes;
          comments[index].userIdLikes = userIdLikes;
          commentStream.updateData({ comments });
        }
      );
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
};

export const deleteComment = (buttonDeleteE, commentId, cookies) => {
  return () => {
    let subscription;
    if (buttonDeleteE) {
      subscription = deleteComment$(
        buttonDeleteE,
        commentId,
        cookies
      ).subscribe(({ commentId, error }) => {
        if (!error) {
          let { comments } = commentStream.currentState();
          const index = comments.findIndex(
            (comment) => comment.commentId === commentId
          );
          const { parentCommentId, childLevel } = comments[index];
          comments = comments.filter(
            (comment) =>
              !(
                (comment.commentIdList.includes(commentId) &&
                  comment.childLevel > childLevel) ||
                comment.commentId === commentId
              )
          );
          comments = comments.map((comment) => {
            if (comment.commentId === parentCommentId) {
              comment.amountReply--;
              return comment;
            }
            return comment;
          });
          commentStream.updateData({ comments });
        }
      });
    }
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
};
