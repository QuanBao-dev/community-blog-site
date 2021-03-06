import "./PostsFilter.css";

import React, { useEffect, useState } from "react";

import { catchError, pluck } from "rxjs/operators";
import { of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { useHistory } from "react-router-dom";
import loadable from "@loadable/component";
import { userStream } from "../../epic/user";
const LatestPosts = loadable(() => import("../LatestPosts/LatestPosts"));
const ListPost = loadable(() => import("../ListPost/ListPost"));
const PostsFilter = ({ title, tagId, userId }) => {
  const [tag, setTag] = useState();
  const [username, setUsername] = useState();
  const history = useHistory();
  useEffect(() => {
    window.scroll({ top: 0 });
  }, [title]);
  useEffect(() => {
    window.scroll({ top: 0 });
    let subscription;
    if (tagId)
      subscription = ajax("/api/tags/" + tagId)
        .pipe(
          pluck("response", "message"),
          catchError((error) => of({ error }))
        )
        .subscribe((v) => {
          if (!v.error) {
            setTag(v);
          } else {
            history.push("/");
            alert("Invalid Tag");
          }
        });
    return () => {
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);
  useEffect(() => {
    let subscription;
    window.scroll({ top: 0 });
    if (userId)
      subscription = ajax("/api/users/" + userId)
        .pipe(pluck("response", "message"))
        .subscribe((v) => {
          setUsername(v.username);
        });
    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [userId]);
  const { isDarkMode } = userStream.currentState();
  return (
    <div className="container-search-posts">
      <div
        className={`container-search-posts__list-post${
          isDarkMode ? " dark" : ""
        }`}
      >
        {title && (
          <h1 className="header-container-title">Searching for "{title}"</h1>
        )}
        {tag && (
          <div className="header-container-title">
            <h1>
              <span style={{ color: "grey" }}>#</span>
              {tag.tagName}
            </h1>
            <p>
              {tag.quantity} published post{tag.quantity > 1 ? "s" : ""}
            </p>
          </div>
        )}
        {username && <h1 className="header-container-title">{username}</h1>}
        <ListPost title={title} tagId={tagId} userId={userId} />
      </div>
      <div className="container-search-posts__list-latest-post">
        <LatestPosts />
      </div>
    </div>
  );
};

export default PostsFilter;
