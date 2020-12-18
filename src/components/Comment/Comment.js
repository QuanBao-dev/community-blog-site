import "./Comment.css";

import React from "react";
import { useRef } from "react";
import { useCookies } from "react-cookie";

import { userStream } from "../../epic/user";
import {
  useDeleteComment,
  useHandleRepliesList,
  useLikeComment,
} from "../../Hook/comment";
import ReactMarkdown from "react-markdown";
import CommentForm from "../CommentForm/CommentForm";

function Comment({ comment }) {
  const repliesShowRef = useRef();
  const { user } = userStream.currentState();
  const [cookies] = useCookies(["idBloggerUser"]);
  const likeButtonRef = useRef();
  const deleteButtonRef = useRef();

  useHandleRepliesList(
    repliesShowRef,
    comment.amountReply || 0,
    comment.commentId
  );
  useLikeComment(likeButtonRef, user, comment.commentId, cookies);
  useDeleteComment(deleteButtonRef, comment.commentId, cookies);
  return (
    <li
      className="comment-list__comment"
      style={{ marginLeft: `${comment.childLevel * 50 + 10}px` }}
    >
      {user && comment.userId === user.userId && (
        <span className="comment-list__delete-symbol" ref={deleteButtonRef}>
          <i className="fas fa-trash-alt"></i>
        </span>
      )}
      <div className="comment-list__header-comment">
        <div className="comment-list__author-name">
          {comment.username}{" "}
          <span className="comment-list__author-symbol">
            {comment.isAuthor ? "Author" : ""}
          </span>
        </div>
        <div className="comment-list__created-at">
          {timeSince(new Date(comment.createdAt))}
        </div>
      </div>
      <ReactMarkdown className="comment-list__content">
        {comment.content}
      </ReactMarkdown>
      <div className="comment__number-info">
        <span ref={repliesShowRef}>{comment.amountReply || 0} Replies</span>
        <span
          ref={likeButtonRef}
          style={{
            fontWeight:
              user &&
              comment.userIdLikes &&
              JSON.parse(comment.userIdLikes).includes(user.userId)
                ? 900
                : "inherit",
          }}
        >
          {comment.quantityLikes}{" "}
          <span className="like-symbol">
            <i className="far fa-thumbs-up"></i>
          </span>
        </span>
        <CommentForm
          isReply={true}
          commentId={comment.commentId}
          commentLevel={comment.childLevel}
        />
      </div>
    </li>
  );
}

const timeSince = (date) => {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  if (Math.floor(seconds) === 1) {
    return Math.floor(seconds) + " second";
  }
  if (Math.floor(seconds) === 0) {
    return "Recently";
  }
  return Math.floor(seconds) + " seconds";
};

export default Comment;
