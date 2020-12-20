import "./Blog.css";

import React from "react";

import BlogInputEdit from "../../components/BlogInputEdit/BlogInputEdit";
import Comments from "../../components/Comments/Comments";
import LatestPosts from "../../components/LatestPosts/LatestPosts";
import VoteBlog from "../../components/VoteBlog/VoteBlog";

const Blog = (props) => {
  const { postId } = props.match.params;
  return (
    <div className="container-blog">
      <VoteBlog postId={postId} />
      <div className="container-editor-blog">
        <div className="editor-blog">
          <BlogInputEdit postId={postId} />
          <Comments postId={postId} />
        </div>
        <div className="container-news">
          <LatestPosts />
          <LatestPosts isAuthor={true} />
        </div>
      </div>
    </div>
  );
};

export default Blog;
