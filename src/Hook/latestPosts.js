import { useEffect } from "react";
import { fetchLatestPosts, initLatestPosts } from "../Functions/latestPosts";

export const useInitLatestPosts = (setLatestPostsState) => {
  useEffect(initLatestPosts(setLatestPostsState), []);
};

export const useFetchLatestPosts = (
  { shouldFetchLatestPost, authorId },
  isAuthor
) => {
  useEffect(fetchLatestPosts(isAuthor), [shouldFetchLatestPost, authorId]);
};
