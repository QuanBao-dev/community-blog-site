import "./VoteBlog.css";

import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";

import { userStream } from "../../epic/user";
import {
  useDownVoteBlog,
  useFetchVoteBlog,
  useInitVoteBlog,
  useUpVoteBlog,
  voteBlogStream,
} from "../../Hook/voteBlog";
import { fromEvent } from "rxjs";
import { filter } from "rxjs/operators";
import { blogInputEditStream } from "../../epic/blogInputEdit";
import {
  changeTriggerSave,
  toggleStateEdit,
} from "../../Functions/blogInputEdit";
import { usePublishPost } from "../../Hook/blogInputEdit";
import { useHistory } from "react-router-dom";
const VoteBlog = ({ postId }) => {
  const upVoteButtonRef = useRef();
  const downVoteButtonRef = useRef();
  const history = useHistory();
  const { user } = userStream.currentState();
  const [cookies] = useCookies(["idBloggerUser"]);
  const [userState, setUserState] = useState(userStream.currentState());
  const [blogInputState, setBlogInputState] = useState(
    blogInputEditStream.currentState()
  );
  const penSquareRef = useRef();
  const buttonUploadRef = useRef();
  const [voteBlogState, setVoteBlogState] = useState(
    voteBlogStream.currentState()
  );
  const { screenWidth } = userState;
  const { toggleEditMode, isShowBar } = blogInputState;

  useEffect(() => {
    let subscription2;
    if (penSquareRef.current)
      subscription2 = fromEvent(penSquareRef.current, "click")
        .pipe(filter(() => blogInputEditStream.currentState().toggleEditMode))
        .subscribe(() => {
          // setIsShowBar(!isShowBar);
          blogInputEditStream.updateData({
            isShowBar: !blogInputEditStream.currentState().isShowBar,
          });
        });
    return () => {
      subscription2 && subscription2.unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    const subscription = userStream.subscribe(setUserState);
    const blogInputSub = blogInputEditStream.subscribe(setBlogInputState);
    return () => {
      subscription.unsubscribe();
      blogInputSub.unsubscribe();
    };
  }, []);
  useInitVoteBlog(setVoteBlogState);
  useFetchVoteBlog(postId);
  useUpVoteBlog(postId, upVoteButtonRef, cookies);
  useDownVoteBlog(postId, downVoteButtonRef, cookies);
  usePublishPost(buttonUploadRef.current, cookies, history, postId);
  if (postId === "create") {
    return <div></div>;
  }
  return (
    <div
      className={
        screenWidth >= 624
          ? `vote-menu-controller`
          : "vote-menu-controller-mobile"
      }
    >
      <div className="wrapper-vote">
        <i
          style={{
            color:
              user && voteBlogState.upVotesUserIdList.includes(user.userId)
                ? "black"
                : "grey",
          }}
          ref={upVoteButtonRef}
          className="fa fa-caret-up"
        ></i>
        <div>
          {voteBlogState.upVotesUserIdList.length -
            voteBlogState.downVotesUserIdList.length >
          0
            ? "+"
            : ""}
          {voteBlogState.upVotesUserIdList.length -
            voteBlogState.downVotesUserIdList.length}
        </div>
        <i
          style={{
            color:
              user && voteBlogState.downVotesUserIdList.includes(user.userId)
                ? "black"
                : "grey",
          }}
          ref={downVoteButtonRef}
          className="fa fa-caret-down"
        ></i>
        {user &&
          !blogInputEditStream.currentState().toggleEditMode &&
          blogInputEditStream.currentState().dataBlogPage.userId ===
            user.userId && (
            <i onClick={toggleStateEdit} className="fas fa-pencil-alt"></i>
          )}
        {blogInputEditStream.currentState().toggleEditMode && (
          <i onClick={toggleStateEdit} className="fas fa-check-circle"></i>
        )}
        <span ref={penSquareRef}>
          <i
            className="fas fa-palette"
            style={{
              display: toggleEditMode && !isShowBar ? "block" : "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
          ></i>
          <i
            className="fas fa-times"
            style={{
              display: toggleEditMode && isShowBar ? "block" : "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
          ></i>
        </span>
        {blogInputEditStream.currentState().toggleEditMode &&
          !blogInputEditStream.currentState().isSaved && (
            <i
              onClick={() => {
                if (blogInputEditStream.currentState().toggleEditMode)
                  changeTriggerSave();
              }}
              className="far fa-save"
            ></i>
          )}
        <i
          ref={buttonUploadRef}
          style={{
            display:
              blogInputEditStream.currentState().isCompleted === false
                ? "inline-block"
                : "none",
          }}
          className="fas fa-upload"
        ></i>
      </div>
    </div>
  );
};

export default VoteBlog;
