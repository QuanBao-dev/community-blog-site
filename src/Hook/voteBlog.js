import { useEffect } from 'react';

import { downVoteBlog, fetchVoteBlog, initVoteBlog, upVoteBlog } from '../Functions/voteBlog';
import voteBlogStore from '../store/voteBlog';

export const voteBlogStream = voteBlogStore;

export const useInitVoteBlog = (setVoteBlogState) => {
  useEffect(initVoteBlog(setVoteBlogState), []);
};

export const useFetchVoteBlog = (postId) => {
  useEffect(fetchVoteBlog(postId), [postId]);
};

export const useUpVoteBlog = (postId, upVoteButtonRef, cookies) => {
  useEffect(upVoteBlog(postId, upVoteButtonRef.current, cookies), [
    postId,
    upVoteButtonRef.current,
  ]);
};

export const useDownVoteBlog = (postId, downVoteButtonRef, cookies) => {
  useEffect(downVoteBlog(postId, downVoteButtonRef.current, cookies), [
    postId,
    downVoteButtonRef.current,
  ]);
};
