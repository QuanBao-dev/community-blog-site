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
import ButtonEditPost from "../ButtonEditPost/ButtonEditPost";
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
  const { screenWidth, isDarkMode } = userState;
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
      <div
        className={`wrapper-vote${isDarkMode ? " dark" : ""}`}
        style={{
          color: !userStream.currentState().isDarkMode ? "black" : "white",
        }}
      >
        <ButtonEditPost
          style={{
            color:
              user && voteBlogState.upVotesUserIdList.includes(user.userId)
                ? !userStream.currentState().isDarkMode
                  ? "black"
                  : "white"
                : "grey",
          }}
          refCustom={upVoteButtonRef}
          className="fa fa-caret-up"
          title={"Up vote"}
        />
        <div>
          {voteBlogState.upVotesUserIdList.length -
            voteBlogState.downVotesUserIdList.length >
          0
            ? "+"
            : ""}
          {voteBlogState.upVotesUserIdList.length -
            voteBlogState.downVotesUserIdList.length}
        </div>
        <ButtonEditPost
          style={{
            color:
              user && voteBlogState.downVotesUserIdList.includes(user.userId)
                ? !userStream.currentState().isDarkMode
                  ? "black"
                  : "white"
                : "grey",
          }}
          refCustom={downVoteButtonRef}
          className="fa fa-caret-down"
          title={"Down vote"}
        />
        {user &&
          !blogInputEditStream.currentState().toggleEditMode &&
          blogInputEditStream.currentState().dataBlogPage.userId ===
            user.userId && (
            // <i onClick={toggleStateEdit} className="fas fa-pencil-alt"></i>
            <ButtonEditPost
              className={"fas fa-pencil-alt"}
              onClick={toggleStateEdit}
              title={"Edit"}
            />
          )}
        {blogInputEditStream.currentState().toggleEditMode && (
          // <i onClick={toggleStateEdit} className="fas fa-check-circle"></i>
          <ButtonEditPost
            className={"fas fa-check-circle"}
            onClick={toggleStateEdit}
            title={"Done"}
          />
        )}
        <span ref={penSquareRef}>
          <ButtonEditPost
            className="fas fa-palette"
            style={{
              display: toggleEditMode && !isShowBar ? "block" : "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
            title={"Tool"}
          />
          <ButtonEditPost
            className="fas fa-times"
            style={{
              display: toggleEditMode && isShowBar ? "block" : "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
            title={"Close tool"}
          />
        </span>
        {blogInputEditStream.currentState().toggleEditMode &&
          !blogInputEditStream.currentState().isSaved && (
            <ButtonEditPost
              className={"far fa-save"}
              onClick={() => {
                if (blogInputEditStream.currentState().toggleEditMode)
                  changeTriggerSave();
              }}
              title={"Save"}
            />
          )}
        <ButtonEditPost
          refCustom={buttonUploadRef}
          style={{
            display:
              user &&
              blogInputEditStream.currentState().dataBlogPage &&
              blogInputEditStream.currentState().dataBlogPage.userId ===
                user.userId &&
              blogInputEditStream.currentState().isCompleted === false
                ? "inline-block"
                : "none",
          }}
          className="fas fa-upload"
          title={"Upload"}
        />
      </div>
    </div>
  );
};

export default VoteBlog;
