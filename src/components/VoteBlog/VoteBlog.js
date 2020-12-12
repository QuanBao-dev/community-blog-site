import "./VoteBlog.css";

import React, { useRef, useState } from "react";
import { useCookies } from "react-cookie";

import {
  useDownVoteBlog,
  useUpVoteBlog,
  useInitVoteBlog,
  voteBlogStream,
  useFetchVoteBlog,
} from "../../Hook/voteBlog";
import { userStream } from "../../epic/user";

const VoteBlog = ({ postId }) => {
  const upVoteButtonRef = useRef();
  const downVoteButtonRef = useRef();
  const { user } = userStream.currentState();
  const [cookies] = useCookies(["idBloggerUser"]);
  const [voteBlogState, setVoteBlogState] = useState(
    voteBlogStream.currentState()
  );
  useInitVoteBlog(setVoteBlogState);
  useFetchVoteBlog(postId);
  useUpVoteBlog(postId, upVoteButtonRef, cookies);
  useDownVoteBlog(postId, downVoteButtonRef, cookies);
  // console.log(voteBlogState, user);
  return (
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
  );
};

export default VoteBlog;
