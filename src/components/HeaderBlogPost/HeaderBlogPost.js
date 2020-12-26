import "./HeaderBlogPost.css";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

import { userStream } from "../../epic/user";
import HeaderEditForm from "../HeaderEditForm/HeaderEditForm";
import {
  useCreatePost,
  useEraseEditPost,
  useInitHeaderBlogPost,
} from "../../Hook/listPost";
import { popularTagsStream } from "../../epic/popularTags";
import { useCookies } from "react-cookie";
import { tabBarStream } from "../../epic/tabBar";

const HeaderBlogPost = ({
  title,
  tags,
  user,
  updatedAt,
  excerpt,
  post,
  postId,
}) => {
  const userLogin = userStream.currentState().user;
  console.log(userLogin, user);
  const [dataSend, setDataSend] = useState([]);
  const [trigger, setTrigger] = useState(true);
  const [cookies] = useCookies(["idBloggerUser"]);

  const boardEditRef = useRef();
  const editButtonRef = useRef();
  const buttonSubmitRef = useRef();
  const titleRef = useRef();
  const introRef = useRef();
  const tagRef = useRef();

  const tabMode = tabBarStream.currentState().tabMode;
  useInitHeaderBlogPost(boardEditRef, postId);
  useEraseEditPost(
    { current: null },
    editButtonRef,
    boardEditRef,
    trigger,
    setTrigger,
    triggerFetchTagsTop,
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
  useEffect(() => {
    if (introRef.current && titleRef.current) {
      introRef.current.value = post.excerpt;
      titleRef.current.value = post.title;
      if (post.tags) setDataSend(post.tags.map((tag) => tag.tagName));
      // console.log(post.tags);
    }
  }, [post.excerpt, post.tags, post.title]);

  return (
    <div className="header-blog-post">
      <h1 className="header-blog-post__child-container">{title}</h1>
      {tags && (
        <div className="header-blog-post__child-container">
          {tags.map((tag, key) => (
            <Link
              to={"/tags/" + tag.tagId}
              key={key}
              className="header-blog-post__tag-name"
            >
              #{tag.tagName || tag}
            </Link>
          ))}
        </div>
      )}
      {user && (
        <Link
          to={"/posts/user/" + user.userId}
          className="header-blog-post__author-username"
        >
          {user.username}
        </Link>
      )}
      {updatedAt && (
        <span className="header-blog-post__date-updated">
          {new Date(updatedAt).toUTCString()}
        </span>
      )}
      <ReactMarkdown className="header-blog-post__excerpt-post header-blog-post__child-container">
        {excerpt}
      </ReactMarkdown>
      {userLogin && user && user.userId === userLogin.userId && (
        <i className="edit-header-post fas fa-edit" ref={editButtonRef}></i>
      )}
      <HeaderEditForm
        boardEditRef={boardEditRef}
        introRef={introRef}
        titleRef={titleRef}
        title={title}
        excerpt={excerpt}
        buttonSubmitRef={buttonSubmitRef}
        dataSend={dataSend}
        setDataSend={setDataSend}
        tagRef={tagRef}
      />
    </div>
  );
};

export default HeaderBlogPost;
function triggerFetchTagsTop() {
  popularTagsStream.updateData({
    triggerFetchTags: !popularTagsStream.currentState().triggerFetchTags,
  });
}
