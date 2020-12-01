import "./ListTag.css";

import React from "react";
import { Link } from "react-router-dom";

const ListTag = ({ tags }) => {
  return (
    <div className="tag-list">
      {tags.map((tag, index) => (
        <div key={index}>
          <div className="tag-item-container">
            <Link className="tag-list__tag-name" to={"/tags/" + tag.tagId}>
              #{tag.tagName}
            </Link>
            <div className="tag-list__quantity">
              {tag.quantity} post{tag.quantity > 1 ? "s":""} published
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListTag;
