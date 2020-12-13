import "./LatestPosts.css";

import React, { useState } from "react";

import { latestPostsStream } from "../../epic/latestPosts";
import {
  useFetchLatestPosts,
  useInitLatestPosts,
} from "../../Hook/latestPosts";
import LatestPost from "../LatestPost/LatestPost";

const LatestPosts = ({ isAuthor }) => {
  const [latestPostsState, setLatestPostsState] = useState(
    latestPostsStream.currentState()
  );
  useInitLatestPosts(setLatestPostsState);
  useFetchLatestPosts(latestPostsState, isAuthor);
  if (isAuthor)
    return (
      <ul className="container-latest-posts">
        <h1>Latest Author's Posts</h1>
        {latestPostsState.latestPostAuthor.map((post) => (
          <LatestPost key={post.postId} post={post} />
        ))}
      </ul>
    );
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
