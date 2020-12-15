import { fetchLatestPosts$, latestPostsStream } from "../epic/latestPosts";
export const initLatestPosts = (setLatestPostsState) => {
  return () => {
    const subscription = latestPostsStream.subscribe(setLatestPostsState);
    latestPostsStream.init();
    return () => {
      subscription.unsubscribe();
    };
  };
};

export const fetchLatestPosts = (isAuthor) => {
  return () => {
    const subscription = fetchLatestPosts$(isAuthor).subscribe((v) => {
      if (!isAuthor)
        latestPostsStream.updateData({
          latestPost: v,
          shouldFetchLatestPost: false,
        });
      else {
        latestPostsStream.updateData({
          latestPostAuthor: v,
          shouldFetchLatestPostAuthor: false,
        });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  };
};
