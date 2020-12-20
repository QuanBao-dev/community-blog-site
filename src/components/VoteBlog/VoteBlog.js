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
let posY1 = 0;
let posY2 = 0;
const VoteBlog = ({ postId }) => {
  const upVoteButtonRef = useRef();
  const downVoteButtonRef = useRef();
  const { user } = userStream.currentState();
  const [cookies] = useCookies(["idBloggerUser"]);
  const [isDown, setIsDown] = useState(true);
  const [userState, setUserState] = useState(userStream.currentState());
  const [voteBlogState, setVoteBlogState] = useState(
    voteBlogStream.currentState()
  );
  useEffect(() => {
    const subscription = userStream.subscribe(setUserState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const scrollingSub = fromEvent(window.document, "scroll").subscribe(() => {
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
  }, [isDown]);
  useInitVoteBlog(setVoteBlogState);
  useFetchVoteBlog(postId);
  useUpVoteBlog(postId, upVoteButtonRef, cookies);
  useDownVoteBlog(postId, downVoteButtonRef, cookies);
  if (postId === "create") {
    return <div></div>;
  }
  const { screenWidth } = userState;
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
      </div>
    </div>
  );
};

export default VoteBlog;
