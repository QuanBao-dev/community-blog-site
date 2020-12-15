import React from 'react';

import PostsFilter from '../../components/PostsFilter/PostsFilter';

const UserCompletedPosts = ({ match }) => {
  const { userId } = match.params;
  return <PostsFilter userId={userId} />;
};

export default UserCompletedPosts;
