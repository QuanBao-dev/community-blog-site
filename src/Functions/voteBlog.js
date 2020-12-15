import { latestPostsStream } from "../epic/latestPosts";
import { listPostStream } from "../epic/listPost";
import { downVoteBlog$, upVoteBlog$, fetchVoteBlog$ } from "../epic/voteBlog";
import { voteBlogStream } from "../Hook/voteBlog";

export const initVoteBlog = (setVoteBlogState) => {
  return () => {
    const subscription = voteBlogStream.subscribe(setVoteBlogState);
    voteBlogStream.init();
    return () => {
      subscription.unsubscribe();
    };
  };
};

export const fetchVoteBlog = (postId) => {
  return () => {
    const subscription = fetchVoteBlog$(postId).subscribe(
      ({ downVotesUserIdList, upVotesUserIdList, error }) => {
        if (!error) {
          voteBlogStream.updateData({
            downVotesUserIdList: JSON.parse(downVotesUserIdList),
            upVotesUserIdList: JSON.parse(upVotesUserIdList),
          });
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  };
};

export const upVoteBlog = (postId, upVoteButtonElement, cookies) => {
  return () => {
    let subscription;
    if (upVoteButtonElement)
      subscription = upVoteBlog$(
        postId,
        upVoteButtonElement,
        cookies
      ).subscribe(({ error, downVotesUserIdList, upVotesUserIdList }) => {
        if (!error) {
          latestPostsStream.updateData({ shouldFetchLatestPost: true });
          voteBlogStream.updateData({
            downVotesUserIdList: JSON.parse(downVotesUserIdList),
            upVotesUserIdList: JSON.parse(upVotesUserIdList),
          });
          let { listPost } = listPostStream.currentState();
          listPost = listPost.map((post) => {
            if (post.postId === postId) {
              return {
                ...post,
                downVotesUserIdList,
                upVotesUserIdList,
              };
            }
            return post;
          });
          listPostStream.updateData({ listPost });
        }
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
};

export const downVoteBlog = (postId, downVoteButtonElement, cookies) => {
  return () => {
    let subscription;
    if (downVoteButtonElement)
      subscription = downVoteBlog$(
        postId,
        downVoteButtonElement,
        cookies
      ).subscribe(({ error, downVotesUserIdList, upVotesUserIdList }) => {
        if (!error) {
          latestPostsStream.updateData({ shouldFetchLatestPost: true });
          voteBlogStream.updateData({
            downVotesUserIdList: JSON.parse(downVotesUserIdList),
            upVotesUserIdList: JSON.parse(upVotesUserIdList),
          });
          let { listPost } = listPostStream.currentState();
          listPost = listPost.map((post) => {
            if (post.postId === postId) {
              return {
                ...post,
                downVotesUserIdList,
                upVotesUserIdList,
              };
            }
            return post;
          });
          listPostStream.updateData({ listPost });
        }
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
};
