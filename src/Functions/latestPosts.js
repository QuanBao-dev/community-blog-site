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

export const fetchLatestPosts = () => {
  return () => {
    const subscription = fetchLatestPosts$().subscribe((v) => {
      console.log("fetch");
      latestPostsStream.updateData({
        latestPost: v,
        shouldFetchLatestPost: false,
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  };
};
