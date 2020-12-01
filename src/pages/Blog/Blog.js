import "./Blog.css";

import React from "react";

import BlogInputEdit from "../../components/BlogInputEdit/BlogInputEdit";
import Comments from "../../components/Comments/Comments";

const Blog = (props) => {
  const { postId } = props.match.params;
  return (
    <div className="editor-blog">
      <BlogInputEdit postId={postId} />
      <Comments postId={postId} />
    </div>
  );
};

export default Blog;
