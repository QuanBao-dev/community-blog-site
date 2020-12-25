import React from "react";
import { userStream } from "../../epic/user";
const NotFound = () => {
  const { isDarkMode } = userStream.currentState();
  return (
    <div style={{ color: isDarkMode ? "white" : "black" }}>
      404 Page Not Found
    </div>
  );
};

export default NotFound;
