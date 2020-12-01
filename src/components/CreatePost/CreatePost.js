import "./CreatePost.css";

import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import Input from "../Input/Input";

const CreatePost = () => {
  const [dataSend, setDataSend] = useState([]);
  const titleRef = useRef();
  const introductionRef = useRef();
  const tagRef = useRef();
  const history = useHistory();
  // console.log(dataSend);
  return (
    <div className="form-create-post-container">
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
