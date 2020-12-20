import "./PopularTags.css";
import { ajax } from "rxjs/ajax";
import { pluck } from "rxjs/operators";
import React, { useEffect, useState } from "react";
import { popularTagsStream } from "../../epic/popularTags";
import { Link } from "react-router-dom";

const PopularTags = () => {
  const [popularTagsState, setPopularTagsState] = useState(
    popularTagsStream.currentState()
  );
  useEffect(() => {
    const subscription = popularTagsStream.subscribe(setPopularTagsState);
    popularTagsStream.init();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = fetchTagsTop$().subscribe((v) => {
      popularTagsStream.updateData({ topPopularTags: v });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [popularTagsState.triggerFetchTags]);

  return (
    <div className="home-page__container-popular-tags">
      <div className="title-bolder">Popular Tags</div>
      <ul className="list-tag">
        {popularTagsState.topPopularTags.map((tag, key) => (
          <Link to={`/tags/${tag.tagId}/posts`} key={key} className="popular-tag-link">
            <li className="tag-item">#{tag.tagName} ({tag.quantity})</li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

const fetchTagsTop$ = () => {
  return ajax({
    url: "/api/tags?page=1",
  }).pipe(pluck("response", "message","tags"));
};
export default PopularTags;
