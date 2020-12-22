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
let posY1 = 0;
let posY2 = 0;
const VoteBlog = ({ postId }) => {
  const upVoteButtonRef = useRef();
  const downVoteButtonRef = useRef();
  const { user } = userStream.currentState();
  const [cookies] = useCookies(["idBloggerUser"]);
  const [isDown, setIsDown] = useState(true);
  const [userState, setUserState] = useState(userStream.currentState());
  const [blogInputState, setBlogInputState] = useState(
    blogInputEditStream.currentState()
  );
  const penSquareRef = useRef();
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

  useEffect(() => {
    const scrollingSub = fromEvent(window.document, "scroll")
      .pipe(filter(() => screenWidth < 624))
      .subscribe(() => {
        posY2 = posY1 - window.scrollY;
        posY1 = window.scrollY;
        if (posY2 > 3 && isDown) {
          setIsDown(false);
        } else if (posY2 < 0 && !isDown) {
          setIsDown(true);
        }
      });
    return () => {
      scrollingSub.unsubscribe();
    };
  }, [isDown, screenWidth]);
  useInitVoteBlog(setVoteBlogState);
  useFetchVoteBlog(postId);
  useUpVoteBlog(postId, upVoteButtonRef, cookies);
  useDownVoteBlog(postId, downVoteButtonRef, cookies);
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
      style={{
        transform:
          screenWidth < 624
            ? isDown
              ? "translateY(100px)"
              : "translateY(0)"
            : "translateY(100px)",
      }}
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
        <span ref={penSquareRef}>
          <i
            className="fas fa-pen-square"
            style={{
              display: toggleEditMode && !isShowBar ? "block" : "none",
            }}
          ></i>
          <i
            className="fas fa-times"
            style={{
              display: toggleEditMode && isShowBar ? "block" : "none",
            }}
          ></i>
        </span>
      </div>
    </div>
  );
};

export default VoteBlog;
