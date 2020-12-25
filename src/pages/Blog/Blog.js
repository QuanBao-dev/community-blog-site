import './Blog.css';

import loadable from '@loadable/component';
import React from 'react';

import BlogInputEdit from '../../components/BlogInputEdit/BlogInputEdit';

const Comments = loadable(() => import("../../components/Comments/Comments"));

const VoteBlog = loadable(() => import("../../components/VoteBlog/VoteBlog"));
const LatestPosts = loadable(() =>
  import("../../components/LatestPosts/LatestPosts")
);

const Blog = (props) => {
  const { postId, isPending } = props.match.params;
  return (
    <div className="container-blog">
      <VoteBlog postId={postId} />
      <div className="container-editor-blog">
        <div className="editor-blog">
          <BlogInputEdit postId={postId} isPending={isPending}/>
          <Comments postId={postId} />
        </div>
        <div className="container-news">
          <LatestPosts />
          <LatestPosts isAuthor={true} />
        </div>
      </div>
    </div>
  );
};

export default Blog;
