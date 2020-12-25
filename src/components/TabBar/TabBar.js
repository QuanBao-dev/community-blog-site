import "./TabBar.css";

import React, { useEffect, useState } from "react";

import { tabBarStream } from "../../epic/tabBar";
import { userStream } from "../../epic/user";

const TabBar = () => {
  const [tabBarState, setTabBarState] = useState(tabBarStream.currentState());
  const { isDarkMode } = userStream.currentState();
  useEffect(() => {
    const subscription = tabBarStream.subscribe(setTabBarState);
    tabBarStream.init();
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return (
    <div className={`home-page__tab-bar${isDarkMode ? " dark" : ""}`}>
      <div
        className={`home-page__tab-item${
          tabBarState.tabMode === 1 ? " tab-item-active" : ""
        }`}
        onClick={() => tabBarStream.updateData({ tabMode: 1 })}
      >
        All Published Posts
      </div>
      <div
        className={`home-page__tab-item${
          tabBarState.tabMode === 2 ? " tab-item-active" : ""
        }`}
        onClick={() => tabBarStream.updateData({ tabMode: 2 })}
      >
        My Published Posts
      </div>
      <div
        className={`home-page__tab-item${
          tabBarState.tabMode === 3 ? " tab-item-active" : ""
        }`}
        onClick={() => tabBarStream.updateData({ tabMode: 3 })}
      >
        My Pending Posts
      </div>
    </div>
  );
};

export default TabBar;
