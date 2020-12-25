import "./ListPost.css";

import React, { useState } from "react";
import { useCookies } from "react-cookie";

import { listPostStream } from "../../epic/listPost";
import { tabBarStream } from "../../epic/tabBar";
import {
  useInitListPost,
  useResetTabBar,
  useStopFetch,
  useUpdateDataListPost,
  useUpdatePageScrolling,
  useUpdateParams,
} from "../../Hook/listPost";
import Post from "../Post/Post";
import { userStream } from "../../epic/user";

const ListPost = ({ tagId, title, userId }) => {
  const [listPostState, setListPostState] = useState(
    listPostStream.currentState()
  );
  const [tabBarState, setTabBarState] = useState(tabBarStream.currentState());
  const [cookie] = useCookies(["idBloggerUser"]);
  useUpdateParams(tagId, title, userId);
  useInitListPost(setListPostState, setTabBarState);
  useResetTabBar(tabBarState, listPostState);

  useUpdateDataListPost(
    listPostState,
    tabBarState,
    cookie,
    title,
    tagId,
    userId
  );
  useUpdatePageScrolling(listPostState);
  useStopFetch(listPostState);
  const { isDarkMode } = userStream.currentState();
  return (
    <ul className={`list-post-container${isDarkMode ? " dark" : ""}`}>
      {listPostState.listPost.length === 0 &&
        listPostState.latestPageFetched !== null && (
          <h3>Don't have any result</h3>
        )}
      {listPostState.listPost.length > 0 &&
        listPostState.listPost.map((post) => {
          return <Post key={post.postId} post={post} />;
        })}
      {!listPostState.isStopFetching &&
        !listPostState.isStillFetchingWhenScrolling && (
          <div className="loading-symbol">
            <i className="fas fa-cog fa-spin fa-2x"></i>
          </div>
        )}
    </ul>
  );
};

export default ListPost;
