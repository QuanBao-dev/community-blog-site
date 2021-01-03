import "./ButtonEditPost.css";

import React from "react";
import { userStream } from "../../epic/user";

const ButtonEditPost = ({
  onClick,
  onMouseDown,
  className,
  style,
  title,
  refCustom,
}) => {
  return (
    <div className="container-button-post">
      <i
        onClick={onClick}
        className={className + " button-post"}
        style={style}
        ref={refCustom}
        onMouseDown={onMouseDown}
      ></i>
      {userStream.currentState().screenWidth >= 624 && (
        <span className="hint-title-post">{title}</span>
      )}
    </div>
  );
};

export default ButtonEditPost;
