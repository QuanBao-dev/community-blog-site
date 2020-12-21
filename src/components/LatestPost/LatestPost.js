import "./LatestPost.css";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const LatestPost = ({ post }) => {
  return (
    <li className="latest-post-item">
      <div>
        <Link
          to={"/posts/user/" + post.user.userId}
          className="latest-post-item__username"
        >
          {post.user.username}
        </Link>
      </div>
      <div className="latest-post-item__title-container">
        <Link to={"/blog/" + post.postId} className="latest-post-item__title">
          {post.title}
        </Link>
      </div>
      <ReactMarkdown className="latest-post-item__excerpt">
        {post.excerpt}
      </ReactMarkdown>
      <ul className="latest-post-item__tag-list">
        {post.tags.map((tag) => (
          <Link to={"/tags/" + tag.tagId} key={tag.tagId}>
            <li>#{tag.tagName}</li>
          </Link>
        ))}
      </ul>
      <div>
        <span>
          <span>
            {Math.abs(
              JSON.parse(post.upVotesUserIdList || "[]").length -
                JSON.parse(post.downVotesUserIdList || "[]").length
            )}
          </span>{" "}
          {JSON.parse(post.upVotesUserIdList || "[]").length -
            JSON.parse(post.downVotesUserIdList || "[]").length >=
            0 && <i className="far fa-thumbs-up"></i>}
          {JSON.parse(post.upVotesUserIdList || "[]").length -
            JSON.parse(post.downVotesUserIdList || "[]").length <
            0 && <i className="far fa-thumbs-down"></i>}
        </span>
      </div>
    </li>
  );
};
export default LatestPost;
