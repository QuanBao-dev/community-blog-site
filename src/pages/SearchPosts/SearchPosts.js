import React from "react";

import PostsFilter from "../../components/PostsFilter/PostsFilter";

const SearchPosts = ({ match }) => {
  const { title } = match.params;
  return <PostsFilter title={title} />;
};

export default SearchPosts;
