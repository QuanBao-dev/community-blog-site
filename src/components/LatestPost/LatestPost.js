import "./LatestPost.css";

import React from "react";
import { Link } from "react-router-dom";

const LatestPost = ({ post }) => {
  return (
    <li className="latest-post-item">
      <Link to={"/blog/" + post.postId} className="latest-post-item__title">
        {post.title}
      </Link>
      <p className="latest-post-item__excerpt">{post.excerpt}</p>
      <ul className="latest-post-item__tag-list">
        {post.tags.map((tag) => (
          <Link to={"/tags/" + tag.tagId} key={tag.tagId}>
            <li>#{tag.tagName}</li>
          </Link>
        ))}
      </ul>
    </li>
  );
};
export default LatestPost;
