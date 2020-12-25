import "./CreatePost.css";

import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import Input from "../Input/Input";
import { userStream } from "../../epic/user";

const CreatePost = () => {
  const [dataSend, setDataSend] = useState([]);
  const [isShowCreatePost, setIsShowCreatePost] = useState(false);
  const titleRef = useRef();
  const introductionRef = useRef();
  const tagRef = useRef();
  const history = useHistory();
  // console.log(dataSend);
  const { isDarkMode } = userStream.currentState();
  return (
    <div
      className={`form-create-post-container${isDarkMode ? " dark" : ""}`}
      title={"create post"}
      style={
        !isShowCreatePost
          ? {
              height: 0,
              width: 0,
              overflow: "hidden",
            }
          : {
              height: null,
              width: "90%",
            }
      }
    >
      {!isShowCreatePost && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            textAlign: "center",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => setIsShowCreatePost(!isShowCreatePost)}
        >
          <i className="fas fa-plus"></i>
        </div>
      )}
      {isShowCreatePost && (
        <i
          style={{
            position: "absolute",
            top: 0,
            right: "10px",
            cursor: "pointer",
            display: "inline-block",
            zIndex: 1,
          }}
          onClick={() => setIsShowCreatePost(!isShowCreatePost)}
          className="fas fa-times fa-2x"
        ></i>
      )}
      <div className="form-create-post">
        <Input label={"Title"} input={titleRef} />
        <Input label={"Introduction"} input={introductionRef} />
        <Input
          label={"Tag"}
          input={tagRef}
          isSuggestion={true}
          dataSend={dataSend}
          setDataSend={setDataSend}
        />
        <button
          className="home-page__create-post-button"
          onClick={() => {
            const data = {
              title: titleRef.current.value.trim(),
              excerpt: introductionRef.current.value.trim(),
              tags: dataSend,
            };
            if (data.title === "") return alert("title empty");
            if (data.excerpt === "") return alert("excerpt empty");
            if (data.tags.length === 0) return alert("tags empty");
            blogInputEditStream.updateData({
              dataBlogPage: {
                ...blogInputEditStream.currentState().dataBlogPage,
                ...data,
              },
              isLoading: false,
            });
            history.push("/blog/create");
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
