import "./LatestPosts.css";

import React, { useState } from "react";

import { latestPostsStream } from "../../epic/latestPosts";
import {
  useFetchLatestPosts,
  useInitLatestPosts,
} from "../../Hook/latestPosts";
import LatestPost from "../LatestPost/LatestPost";
import { Link } from "react-router-dom";
import { blogInputEditStream } from "../../epic/blogInputEdit";
import { userStream } from "../../epic/user";

const LatestPosts = ({ isAuthor }) => {
  const [latestPostsState, setLatestPostsState] = useState(
    latestPostsStream.currentState()
  );
  useInitLatestPosts(setLatestPostsState);
  useFetchLatestPosts(latestPostsState, isAuthor);
  const { isDarkMode } = userStream.currentState();
  if (isAuthor)
    return (
      <ul className={`container-latest-posts${isDarkMode ? " dark" : ""}`}>
        <h1>Latest author's Posts</h1>
        {latestPostsState.latestPostAuthor.map((post) => (
          <LatestPost key={post.postId} post={post} />
        ))}
        {blogInputEditStream.currentState().dataBlogPage.user && (
          <Link
            className="container-latest-posts__see-all-posts"
            to={
              "/posts/user/" +
              blogInputEditStream.currentState().dataBlogPage.user.userId
            }
          >
            See all author's posts
          </Link>
        )}
      </ul>
    );
  if (latestPostsState.latestPost.length)
    return (
      <ul className={`container-latest-posts${isDarkMode ? " dark" : ""}`}>
        <h1>Latest Posts</h1>
        {latestPostsState.latestPost.map((post) => (
          <LatestPost key={post.postId} post={post} />
        ))}
      </ul>
    );
  return <div></div>;
};

export default LatestPosts;
