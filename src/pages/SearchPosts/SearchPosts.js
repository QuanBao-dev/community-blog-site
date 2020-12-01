import "./SearchPosts.css";

import React from "react";
import ListPost from "../../components/ListPost/ListPost";

const SearchPosts = ({ match }) => {
  const { title } = match.params;
  return (
    <div>
      <h1>Searching for "{title}"</h1>
      <ListPost title={title} />
    </div>
  );
};

export default SearchPosts;
