import "./DragResizeBlock.css";

import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { blogInputEditStream } from "../../epic/blogInputEdit";
import { saveContent } from "../../Functions/blogInputEdit";
import MenuModifyMedia from "../MenuModifyMedia/MenuModifyMedia";

const DragResizeBlock = ({
  props,
  className,
  url,
  // onClick,
  imageRef,
  iframeRef,
  width,
  height,
  isImage,
  setIsNotEditableState,
  setClassNameState,
  // onClickSkip,
}) => {
  const block = useRef();
  useEffect(() => {
    block.current.addEventListener("mousedown", (e) => {
      mutable(e, block.current, props, url, className);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={block}
      className="drag-resize-block"
      style={{
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
      }}
    >
      {isImage && <img ref={imageRef} src={url} alt="NOT_FOUND" />}
      {!isImage && (
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={url}
          title={url}
        />
      )}
      {blogInputEditStream.currentState().toggleEditMode && (
        <MenuModifyMedia
          height={height}
          width={width}
          isImage={isImage}
          props={props}
          url={url}
          setIsNotEditableState={setIsNotEditableState}
          setClassNameState={setClassNameState}
          isNotEditableState={true}
        />
      )}
    </div>
  );
};

const mutable = function (e, block, props, url, className) {
  // Elements initial width and height
  const h = block.offsetHeight;
  const w = block.offsetWidth;
  // Elements original position
  const t = block.offsetTop;
  const l = block.offsetLeft;
  // Click position within element
  const y = t + h - e.pageY;
  const x = l + w - e.pageX;
  const hasResized = () =>
    !(w === block.offsetWidth && h === block.offsetHeight);

  const resize = (e) => {
    if (blogInputEditStream.currentState().isSaved)
      blogInputEditStream.updateData({
        isSaved: false,
      });
    // Set width/height of element according to mouse position
    const maxWidth = document.querySelector(".public-DraftEditor-content")
      .offsetWidth;
    const width = e.pageX - l + x > maxWidth ? maxWidth : e.pageX - l + x;
    const height = e.pageY - t + y;
    block.style.width = `${width}px`;
    block.style.height = `${height}px`;
    saveContent(
      props.contentState.replaceEntityData(props.entityKey, {
        url: url,
        className: className,
        width: width,
        height: height,
        isImage: true,
        isNotEditable: true,
      })
    );
  };

  const unResize = (e) => {
    // Remove listeners that were bound to document
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", unResize);
    // Emit events according to interaction
    if (hasResized(e)) block.dispatchEvent(new Event("resized"));
    else block.dispatchEvent(new Event("clicked"));
    e.preventDefault();
  };

  // Add follow listener if not resizing
  if (x > 12 && y > 12) {
    e.preventDefault();
  } else {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", unResize);
    e.preventDefault();
  }
};

export default DragResizeBlock;
