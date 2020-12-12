import "./LatestPosts.css";

import React, { useState } from "react";

import { latestPostsStream } from "../../epic/latestPosts";
import {
  useFetchLatestPosts,
  useInitLatestPosts,
} from "../../Hook/latestPosts";
import LatestPost from "../LatestPost/LatestPost";

const LatestPosts = () => {
  const [latestPostsState, setLatestPostsState] = useState(
    latestPostsStream.currentState()
  );
  useInitLatestPosts(setLatestPostsState);
  useFetchLatestPosts(latestPostsState);
  return (
    <ul className="container-latest-posts">
      <h1>Latest Posts</h1>
      {latestPostsState.latestPost.map((post) => (
        <LatestPost key={post.postId} post={post} />
      ))}
    </ul>
  );
};

export default LatestPosts;
