import './UserCompletedPosts.css';

import React, { useEffect, useState } from 'react';
import { ajax } from 'rxjs/ajax';
import { pluck } from 'rxjs/operators';

import ListPost from '../../components/ListPost/ListPost';

const UserCompletedPosts = ({ match }) => {
  const { userId } = match.params;
  const [username, setUsername] = useState();
  useEffect(() => {
    const subscription = ajax("/api/users/" + userId)
      .pipe(pluck("response", "message"))
      .subscribe((v) => setUsername(v.username));
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
  return (
    <div>
      <h1 className="author-header-container">{username}</h1>
      <ListPost userId={userId} />
    </div>
  );
};

export default UserCompletedPosts;
