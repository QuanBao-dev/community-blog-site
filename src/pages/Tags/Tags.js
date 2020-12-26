import "./Tags.css";

import React, { useEffect, useState } from "react";

import ListTag from "../../components/ListTag/ListTag";
import { fetchTags$, tagStream } from "../../epic/tags";
import { userStream } from "../../epic/user";

const Tags = () => {
  const [tagsState, setTagsState] = useState(tagStream.currentState());
  useEffect(() => {
    const subscription = tagStream.subscribe(setTagsState);
    tagStream.init();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = fetchTags$().subscribe((v) => {
      if (!v.error)
        tagStream.updateData({ tagData: v.tags, maxPage: v.maxPage });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const listNavPage = Array.from(Array(tagsState.maxPage).keys());
  const { isDarkMode } = userStream.currentState();
  return (
    <div
      style={{
        color: isDarkMode ? "white" : "black",
      }}
    >
      <h1>All Tags</h1>
      <ListTag tags={tagsState.tagData} />
      <div className="container-list-page">
        <div className="tag-active">
          <i className="fas fa-chevron-left"></i>
          <i className="fas fa-chevron-left"></i>
        </div>
        {listNavPage.map((v, index) => (
          <div
            key={index}
            className={
              tagStream.currentState().currentPage === v + 1 ? "tag-active" : ""
            }
          >
            {v + 1}
          </div>
        ))}
        <div className="tag-active">
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  );
};

export default Tags;
