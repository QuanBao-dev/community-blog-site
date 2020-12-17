import "./Media.css";

import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import DragResizeBlock from "../DragResizeBlock/DragResizeBlock";
import MenuModifyMedia from "../MenuModifyMedia/MenuModifyMedia";

const Media = (props) => {
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
  const [classNameState, setClassNameState] = useState(className);
  const [isNotEditableState, setIsNotEditableState] = useState(isNotEditable);
  const [previousEditModeState, setPreviousEditModeState] = useState();
  useEffect(() => {
    const subscription = blogInputEditStream.subscribe(setBlogInputEditState);
    blogInputEditStream.init();
    blogInputEditStream.updateData({ screenWidth: window.innerWidth });
    return () => {
      subscription.unsubscribe();
    };
  }, [blogInputEditState.screenWidth]);
  return (
    <div className={classNameState || ""}>
      {isNotEditableState && isImage && (
        <div ref={wrapperRef} className="wrapper-image-upload">
          <img
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
                setPreviousEditModeState(
                  blogInputEditStream.currentState().toggleEditMode
                );
                if (blogInputEditStream.currentState().toggleEditMode)
                  blogInputEditStream.updateData({ toggleEditMode: false });
              } else {
                wrapper.className = "wrapper-image-upload";
                if (controlMenu) controlMenu.style.zIndex = 3;
                if (controlMenuFixed) controlMenuFixed.style.zIndex = 8;
                document.body.style.overflow = "auto";
                blogInputEditStream.updateData({
                  toggleEditMode: previousEditModeState,
                });
              }
            }}
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
          {blogInputEditState.toggleEditMode && isNotEditableState && (
            <MenuModifyMedia
              height={height}
              width={width}
              isImage={isImage}
              props={props}
              url={url}
              setIsNotEditableState={setIsNotEditableState}
              isNotEditableState={false}
              setClassNameState={setClassNameState}
            />
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
            <MenuModifyMedia
              height={height}
              width={width}
              isImage={isImage}
              props={props}
              url={url}
              setIsNotEditableState={setIsNotEditableState}
              isNotEditableState={false}
              setClassNameState={setClassNameState}
            />
          )}
        </div>
      )}
      {!isNotEditableState && (
        <DragResizeBlock
          props={props}
          className={classNameState}
          url={url}
          width={width}
          height={height}
          imageRef={imageRef}
          iframeRef={iframeRef}
          isImage={isImage}
          setIsNotEditableState={setIsNotEditableState}
          setClassNameState={setClassNameState}
        />
      )}
    </div>
  );
};
export default Media;
