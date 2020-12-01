import "./DragResizeBlock.css";

import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { blogInputEditStream } from "../../epic/blogInputEdit";

const DragResizeBlock = ({
  url,
  onClick,
  imageRef,
  iframeRef,
  width,
  height,
  isImage,
}) => {
  const block = useRef();
  useEffect(() => {
    block.current.addEventListener("mousedown", mutable);
  }, []);
  return (
    <div
      ref={block}
      className="drag-resize-block"
      style={{
        width: `${width}px`,
        height: `${height}px`,
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
        <button onClick={onClick}>Save</button>
      )}
    </div>
  );
};

const mutable = function (e) {
  blogInputEditStream.updateData({
    isSaved: false,
  });
  // Elements initial width and height
  const h = this.offsetHeight;
  const w = this.offsetWidth;
  // Elements original position
  const t = this.offsetTop;
  const l = this.offsetLeft;
  // Click position within element
  const y = t + h - e.pageY;
  const x = l + w - e.pageX;

  const hasResized = () => !(w === this.offsetWidth && h === this.offsetHeight);

  const resize = (e) => {
    // Set width/height of element according to mouse position
    this.style.width = `${e.pageX - l + x}px`;
    this.style.height = `${e.pageY - t + y}px`;
  };

  const unResize = (e) => {
    // Remove listeners that were bound to document
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", unResize);
    // Emit events according to interaction
    if (hasResized(e)) this.dispatchEvent(new Event("resized"));
    else this.dispatchEvent(new Event("clicked"));
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
