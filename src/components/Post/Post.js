import "./Post.css";

import React, { useState } from "react";
import { useRef } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";

import { popularTagsStream } from "../../epic/popularTags";
import { tabBarStream } from "../../epic/tabBar";
import { userStream } from "../../epic/user";
import { useCreatePost, useEraseEditPost } from "../../Hook/listPost";
import Input from "../Input/Input";

const Post = ({ post }) => {
  const user = userStream.currentState().user;
  const tabMode = tabBarStream.currentState().tabMode;
  const [cookies] = useCookies(["idBloggerUser"]);
  const [trigger, setTrigger] = useState(true);
  const [dataSend, setDataSend] = useState([]);
  const eraseButtonRef = useRef();
  const editButtonRef = useRef();
  const boardEditRef = useRef();
  const buttonSubmitRef = useRef();
  const titleRef = useRef();
  const introRef = useRef();
  const tagRef = useRef();

  useEraseEditPost(
    eraseButtonRef,
    editButtonRef,
    boardEditRef,
    trigger,
    setTrigger,
    triggerFetchTagsTop,
    setDataSend,
    post,
    cookies
  );

  useCreatePost(
    trigger,
    buttonSubmitRef,
    titleRef,
    introRef,
    boardEditRef,
    tagRef,
    post,
    dataSend,
    setDataSend,
    tabMode,
    cookies,
    triggerFetchTagsTop
  );
  const likeQuantity =
    -JSON.parse(post.downVotesUserIdList || "[]").length +
    JSON.parse(post.upVotesUserIdList || "[]").length;
  return (
    <li className="container-post">
      <div className="container-menu-control">
        {user && post.user.userId === user.userId && (
          <span className="edit-post-button" ref={editButtonRef}>
            <i className="fas fa-edit fa-2x"></i>
          </span>
        )}
        {user && post.user.userId === user.userId && (
          <span className="erase-post-button" ref={eraseButtonRef}>
            <i className="fas fa-backspace fa-2x"></i>
          </span>
        )}
      </div>
      <div className="container-author">
        <Link className="author-name" to={`/posts/user/${post.userId}`}>
          {post.user.username}
        </Link>
        <div className="date-upload">
          {new Date(post.updatedAt).toUTCString()}
        </div>
      </div>
      <div className="body-post">
        <Link to={"/blog/" + post.postId} className="container-post__link">
          <div className="title-post">{post.title}</div>
        </Link>
        <div>
          {post.tags.map((tag, index) => {
            return (
              <Link
                key={index}
                className="tag-name"
                to={`/tags/${tag.tagId}/posts`}
              >
                {"#"}
                {tag.tagName}
              </Link>
            );
          })}
        </div>
        <div className="excerpt-post">{post.excerpt}</div>
        <div style={{ opacity: 0.6 }}>
          {Math.abs(likeQuantity)}{" "}
          {likeQuantity >= 0 && <i className="far fa-thumbs-up"></i>}
          {likeQuantity < 0 && <i className="far fa-thumbs-down"></i>}
        </div>
      </div>
      <div className="edit-board-container" ref={boardEditRef}>
        <Input label="Title" input={titleRef} />
        <Input label="Introduction" input={introRef} />
        <Input
          label="Tag"
          input={tagRef}
          isSuggestion={true}
          dataSend={dataSend}
          setDataSend={setDataSend}
        />
        <button
          className="edit-board-container__button-submit"
          ref={buttonSubmitRef}
        >
          Update
        </button>
      </div>
    </li>
  );
};
export default Post;
function triggerFetchTagsTop() {
  popularTagsStream.updateData({
    triggerFetchTags: !popularTagsStream.currentState().triggerFetchTags,
  });
}
