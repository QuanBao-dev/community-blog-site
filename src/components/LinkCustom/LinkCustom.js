import "./LinkCustom.css";

import React, { useEffect, useState } from "react";
import { userStream } from "../../epic/user";

const LinkCustom = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  const [userState, setUserState] = useState(userStream.currentState());
  useEffect(() => {
    const subscription = userStream.subscribe(setUserState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const { isDarkMode } = userState;
  return (
    <a
      className={`custom-link${isDarkMode ? " dark" : ""}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
};

export default LinkCustom;
