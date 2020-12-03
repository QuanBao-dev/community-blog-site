import './CommentForm.css';

import React, { useRef, useState } from 'react';
import { useCookies } from 'react-cookie';

import { userStream } from '../../epic/user';
import { usePostComment } from '../../Hook/comment';

const CommentForm = ({ isReply = false, commentId, commentLevel }) => {
  const buttonRef = useRef();
  const textareaRef = useRef();
  const [toggleReply, setToggleReply] = useState(false);
  const [cookies] = useCookies(["idBloggerUser"]);
  const { user } = userStream.currentState();
  usePostComment(
    isReply,
    commentId,
    commentLevel,
    buttonRef,
    textareaRef,
    cookies,
    setToggleReply
  );
  if (!isReply)
    return (
      <div className="section-container__form">
        <textarea ref={textareaRef} className="textarea-container" />
        <button
          ref={buttonRef}
          className="button-submit"
          disabled={user ? false : true}
        >
          Submit
        </button>
      </div>
    );
  else
    return (
      <div>
        <span
          className="reply-symbol"
          onClick={() => setToggleReply(!toggleReply)}
        >
          <i className="fas fa-reply"></i>
        </span>
        <div
          className="section-container__form"
          style={{
            display: toggleReply ? "block" : "none",
          }}
        >
          <textarea ref={textareaRef} className="textarea-container" />
          <button
            ref={buttonRef}
            className="button-submit"
            disabled={user ? false : true}
          >
            Submit
          </button>
        </div>
      </div>
    );
};

export default CommentForm;
