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
        if (!error)
          voteBlogStream.updateData({
            downVotesUserIdList: JSON.parse(downVotesUserIdList),
            upVotesUserIdList: JSON.parse(upVotesUserIdList),
          });
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
        if (!error)
          voteBlogStream.updateData({
            downVotesUserIdList: JSON.parse(downVotesUserIdList),
            upVotesUserIdList: JSON.parse(upVotesUserIdList),
          });
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
};
