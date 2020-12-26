import "./ListTag.css";

import React from "react";
import { Link } from "react-router-dom";
import { userStream } from "../../epic/user";

const ListTag = ({ tags }) => {
  const { isDarkMode } = userStream.currentState();
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <div key={tag.tagId}>
          <div
            className={`tag-item-container${isDarkMode ? " dark" : ""}`}
          >
            <Link className="tag-list__tag-name" to={"/tags/" + tag.tagId}>
              #{tag.tagName}
            </Link>
            <div className="tag-list__quantity">
              {tag.quantity} post{tag.quantity > 1 ? "s" : ""} published
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListTag;
