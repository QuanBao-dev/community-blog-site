import "./Post.css";

import React, { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import { fromEvent, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  catchError,
  map,
  pluck,
  switchMap,
  switchMapTo,
  tap,
} from "rxjs/operators";

import { listPostStream } from "../../epic/listPost";
import { userStream } from "../../epic/user";
import Input from "../Input/Input";
import { tabBarStream } from "../../epic/tabBar";
import { popularTagsStream } from "../../epic/popularTags";

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

  useEffect(() => {
    let subscription;
    let subscription2;
    if (eraseButtonRef.current)
      subscription = fromEvent(eraseButtonRef.current, "click")
        .pipe(
          switchMapTo(
            ajax({
              url: "/api/posts/" + post.postId,
              method: "DELETE",
              headers: {
                authorization: `Bearer ${cookies.idBloggerUser}`,
              },
            }).pipe(
              pluck("response", "message"),
              catchError((error) => of({ error }))
            )
          )
        )
        .subscribe((v) => {
          if (!v.error) {
            listPostStream.updateData({
              listPost: listPostStream
                .currentState()
                .listPost.filter((postL) => postL.postId !== post.postId),
            });
            triggerFetchTagsTop();
          }
        });
    if (editButtonRef.current)
      subscription2 = fromEvent(editButtonRef.current, "click")
        .pipe(
          tap(() => {
            boardEditRef.current.style.display =
              boardEditRef.current.style.display === "block" ? "none" : "block";
            setTrigger(!trigger);
          })
        )
        .subscribe();
    return () => {
      subscription2 && subscription2.unsubscribe();
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  useEffect(() => {
    let subscription;
    if (buttonSubmitRef.current) {
      subscription = fromEvent(buttonSubmitRef.current, "click")
        .pipe(
          map(() => ({
            title: titleRef.current.value,
            excerpt: introRef.current.value,
            tags: JSON.stringify(dataSend),
            isCompleted: tabMode === 3 ? false : true,
          })),
          tap(() => {
            boardEditRef.current.style.display = "none";
            titleRef.current.value = "";
            introRef.current.value = "";
            tagRef.current.value = "";
          }),
          switchMap((body) =>
            ajax({
              url: "/api/posts/" + post.postId,
              method: "PUT",
              headers: {
                authorization: `Bearer ${cookies.idBloggerUser}`,
              },
              body,
            }).pipe(
              pluck("response", "message"),
              catchError((error) => of({ error }))
            )
          )
        )
        .subscribe((v) => {
          if (!v.error) {
            listPostStream.updateData({
              listPost: listPostStream.currentState().listPost.map((postL) => {
                if (postL.postId === post.postId) {
                  return v;
                }
                return postL;
              }),
            });
            triggerFetchTagsTop();
            setDataSend([]);
          }
        });
    }
    return () => {
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, dataSend]);
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
