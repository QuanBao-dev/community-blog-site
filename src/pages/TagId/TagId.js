import React from "react";

import PostsFilter from "../../components/PostsFilter/PostsFilter";

const TagId = ({ match }) => {
  const { tagId } = match.params;
  return <PostsFilter tagId={tagId} />;
};

export default TagId;
