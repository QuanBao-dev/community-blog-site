import "./Comments.css";

import React from "react";
import { useState } from "react";

import { commentStream } from "../../epic/comment";
import {
  useFetchComment,
  useHandleListPageChange,
  useInitComment,
} from "../../Hook/comment";
import Comment from "../Comment/Comment";
import CommentForm from "../CommentForm/CommentForm";
import { blogInputEditStream } from "../../epic/blogInputEdit";

const Comments = ({ postId }) => {
  const [commentsState, setCommentsState] = useState(
    commentStream.currentState()
  );
  const [listPage, setListPage] = useState(
    Array.from(Array(commentsState.lastPage).keys())
  );
  useInitComment(setCommentsState);
  useFetchComment(postId, commentsState.page);
  useHandleListPageChange(commentsState.lastPage, setListPage);
  if (blogInputEditStream.currentState().currentPostIdPath !== "create")
    if (!commentsState.isLoading)
      return (
        <section className="section-container">
          <CommentForm />
          {commentsState.comments.length > 0 && (
            <ul className="comment-list">
              {commentsState.comments.map((comment) => (
                <Comment comment={comment} key={comment.commentId} />
              ))}
            </ul>
          )}
          <ul className="page-comment-list">
            {listPage.map((page) => (
              <li
                key={page + 1}
                className={commentsState.page === page + 1 ? "active" : null}
                onClick={() => commentStream.updateData({ page: page + 1 })}
              >
                {page + 1}
              </li>
            ))}
          </ul>
        </section>
      );
    else
      return (
        <section className="section-container">
          <CommentForm />
          <div>
            <i className="fas fa-cog fa-spin fa-2x"></i>
          </div>
        </section>
      );
  else return <div></div>;
};

export default Comments;
