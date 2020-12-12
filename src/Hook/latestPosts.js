import { useEffect } from "react";
import { fetchLatestPosts, initLatestPosts } from "../Functions/latestPosts";

export const useInitLatestPosts = (setLatestPostsState) => {
  useEffect(initLatestPosts(setLatestPostsState),[])
}

export const useFetchLatestPosts = ({shouldFetchLatestPost}) => {
  useEffect(fetchLatestPosts(), [shouldFetchLatestPost]);
};
