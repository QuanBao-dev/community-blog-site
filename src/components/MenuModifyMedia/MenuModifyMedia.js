import "./MenuModifyMedia.css";

import React, { useRef } from "react";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import { saveContent } from "../../Functions/blogInputEdit";

const MenuModifyMedia = ({
  props,
  url,
  width,
  height,
  isImage,
  setIsNotEditableState,
  setClassNameState,
  isNotEditableState,
}) => {
  const editButtonsRef = useRef();

  return (
    <span ref={editButtonsRef} className="edit-buttons">
      <button
        className="button-edit-item"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => {
          transformMedia(props, "text-align-left", isImage, url, width, height);
          setClassNameState("text-align-left");
        }}
      >
        <i className="fas fa-align-left"></i>
      </button>
      <button
        className="button-edit-item"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => {
          transformMedia(
            props,
            "text-align-center",
            isImage,
            url,
            width,
            height
          );
          setClassNameState("text-align-center");
        }}
      >
        <i className="fas fa-align-center"></i>
      </button>
      <button
        className="button-edit-item"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => {
          transformMedia(
            props,
            "text-align-right",
            isImage,
            url,
            width,
            height
          );
          setClassNameState("text-align-right");
        }}
      >
        <i className="fas fa-align-right"></i>
      </button>
      <button
        className="button-edit-item"
        onMouseDown={(e) => {
          ///TODO If this is real owner
          e.preventDefault();
          setIsNotEditableState(isNotEditableState);
        }}
      >
        <i className="fas fa-expand-arrows-alt"></i>
      </button>
    </span>
  );
};

function transformMedia(props, className, isImage, url, width, height) {
  saveContent(
    props.contentState.replaceEntityData(props.entityKey, {
      url: url,
      className: className,
      width: width,
      height: height,
      isImage: isImage,
      isNotEditable: true,
    })
  );
  blogInputEditStream.updateData({
    dataBlogPage: blogInputEditStream.currentState().dataBlogPage,
  });
}

export default MenuModifyMedia;
