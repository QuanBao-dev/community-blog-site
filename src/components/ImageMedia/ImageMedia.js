import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import { changeTriggerSave, saveContent } from "../../Functions/blogInputEdit";
import DragResizeBlock from "../DragResizeBlock/DragResizeBlock";

const ImageMedia = (props) => {
  const {
    url,
    className,
    width,
    height,
    isImage = true,
    isNotEditable = true,
  } = props.contentState.getEntity(props.entityKey).getData();
  const [blogInputEditState, setBlogInputEditState] = useState(
    blogInputEditStream.currentState()
  );
  const imageRef = useRef();
  const iframeRef = useRef();
  const wrapperRef = useRef();
  const [isNotEditableState, setIsNotEditableState] = useState(isNotEditable);
  useEffect(() => {
    const subscription = blogInputEditStream.subscribe(setBlogInputEditState);
    blogInputEditStream.init();
    blogInputEditStream.updateData({ screenWidth: window.innerWidth });
    return () => {
      subscription.unsubscribe();
    };
  }, [blogInputEditState.screenWidth]);
  return (
    <div className={className || ""}>
      {isNotEditableState && isImage && (
        <div
          ref={wrapperRef}
          className="wrapper-image-upload"
          onClick={() => {
            const wrapper = wrapperRef.current;
            const controlMenu = document.querySelector(
              ".control-menu-container"
            );
            const controlMenuFixed = document.querySelector(
              ".menu-control-fix"
            );
            if (wrapper.className === "wrapper-image-upload") {
              wrapper.className += " container-image-fullscreen";
              document.body.style.overflow = "hidden";
              if (controlMenuFixed) controlMenuFixed.style.zIndex = 1;
              if (controlMenu) controlMenu.style.zIndex = 0;
            } else {
              wrapper.className = "wrapper-image-upload";
              if (controlMenu) controlMenu.style.zIndex = 3;
              if (controlMenuFixed) controlMenuFixed.style.zIndex = 8;
              document.body.style.overflow = "auto";
            }
          }}
        >
          <img
            src={url}
            alt="NOT_FOUND"
            width={
              blogInputEditStream.currentState().screenWidth < width || !width
                ? "100%"
                : `${width}px`
            }
            height={
              blogInputEditStream.currentState().screenWidth < width || !width
                ? "fit-content"
                : `${height}px`
            }
          />
          {blogInputEditState.toggleEditMode && (
            <button
              style={{
                display:
                  blogInputEditStream.currentState().screenWidth < width
                    ? "none"
                    : "inline-block",
              }}
              className="edit-button"
              onMouseDown={(e) => {
                ///TODO If this is real owner
                e.preventDefault();
                setIsNotEditableState(false);
              }}
            >
              <i className="fas fa-expand-arrows-alt"></i>
            </button>
          )}
        </div>
      )}
      {isNotEditableState && !isImage && (
        <div className="wrapper-iframe-upload">
          <iframe
            title={url}
            src={url}
            alt="NOT_FOUND"
            width={
              blogInputEditStream.currentState().screenWidth < width
                ? blogInputEditStream.currentState().screenWidth - 100
                : `${width}px`
            }
            height={
              blogInputEditStream.currentState().screenWidth < width
                ? "520px"
                : `${height}px`
            }
          />
          {blogInputEditState.toggleEditMode && (
            <button
              style={{
                display:
                  blogInputEditStream.currentState().screenWidth < width
                    ? "none"
                    : "inline-block",
              }}
              className="edit-button"
              onMouseDown={(e) => {
                ///TODO If this is real owner
                e.preventDefault();
                setIsNotEditableState(false);
              }}
            >
              <i className="fas fa-expand-arrows-alt"></i>
            </button>
          )}
        </div>
      )}
      {!isNotEditableState && (
        <DragResizeBlock
          url={url}
          width={width}
          height={height}
          imageRef={imageRef}
          iframeRef={iframeRef}
          isImage={isImage}
          onClick={() => {
            if (imageRef.current)
              saveContent(
                props.contentState.replaceEntityData(props.entityKey, {
                  url: url,
                  className: "text-align-center",
                  width: imageRef.current.offsetWidth,
                  height: imageRef.current.offsetHeight,
                  isImage: true,
                  isNotEditable: true,
                })
              );
            else
              saveContent(
                props.contentState.replaceEntityData(props.entityKey, {
                  url: url,
                  className: "text-align-center",
                  width: iframeRef.current.offsetWidth,
                  height: iframeRef.current.offsetHeight,
                  isImage: false,
                  isNotEditable: true,
                })
              );
            changeTriggerSave();
            blogInputEditStream.updateData({
              isSaved: true,
            });
            setIsNotEditableState(true);
          }}
        />
      )}
    </div>
  );
};
export default ImageMedia;
