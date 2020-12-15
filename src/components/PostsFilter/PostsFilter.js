import "./PostsFilter.css";

import React, { useEffect, useState } from "react";

import LatestPosts from "../LatestPosts/LatestPosts";
import ListPost from "../ListPost/ListPost";
import { catchError, pluck } from "rxjs/operators";
import { of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { useHistory } from "react-router-dom";

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
      setTag(null);
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
        .subscribe((v) => setUsername(v.username));
    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [userId]);

  return (
    <div className="container-search-posts">
      <div className="container-search-posts__list-post">
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
