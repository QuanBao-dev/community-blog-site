import "./BlogInputEdit.css";
import "draft-js/dist/Draft.css";

import {
  CompositeDecorator,
  convertFromRaw,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils,
} from "draft-js";
import React, { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import { userStream } from "../../epic/user";
import {
  changeTriggerSave,
  saveContent,
  toggleStateEdit,
  uploadFile,
} from "../../Functions/blogInputEdit";
import {
  useAutoSave,
  useCheckPageSaved,
  useColorPickerChange,
  useFetchBlogData,
  useInitBlogDetail,
  useInitEditorContent,
  usePublishPost,
  useSaveTrigger,
  useShowHidePublish,
  useShowHideSaving,
  useToggleEdit,
  useUpdateAfterFetch,
} from "../../Hook/blogInputEdit";
import AudioCustom from "../AudioCustom/AudioCustom";
import HeaderBlogPost from "../HeaderBlogPost/HeaderBlogPost";
import Media from "../Media/Media";
import LinkCustom from "../LinkCustom/LinkCustom";
import MenuController from "../MenuController/MenuController";

//////////////

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}
function findMediaEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "PHOTO"
    );
  }, callback);
}
function findAudioEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "AUDIO"
    );
  }, callback);
}

////////////

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: LinkCustom,
  },
  {
    strategy: findMediaEntities,
    component: Media,
  },
  {
    strategy: findAudioEntities,
    component: AudioCustom,
  },
]);

const BlogInputEdit = ({ postId }) => {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(decorator)
  );
  const [blogState, setBlogState] = useState(
    blogInputEditStream.currentState()
  );
  const history = useHistory();
  const [cookies] = useCookies();
  const user = userStream.currentState().user;
  const editorRef = useRef();
  const buttonUpload = document.querySelector(".button-publicize-post");
  const colorPickerInput = document.querySelector(".color-picker-input");

  const onChange = (editorState) => {
    const contentState = editorState.getCurrentContent();
    setEditorState(editorState);
    saveContent(contentState);
  };

  useInitBlogDetail(onChange, decorator, setBlogState);
  useInitEditorContent(
    postId,
    blogState,
    cookies,
    onChange,
    convertFromRaw,
    decorator
  );
  useFetchBlogData(blogState, postId, onChange, history, decorator);

  useAutoSave(cookies, history);
  useSaveTrigger(cookies, blogState, history);
  usePublishPost(buttonUpload, cookies, history, postId);

  useToggleEdit(blogState);
  useShowHidePublish(blogState);
  useShowHideSaving(blogState);
  useUpdateAfterFetch(editorState, onChange, blogState);
  useCheckPageSaved(blogState, editorState);
  useColorPickerChange(colorPickerInput, editorState, onChange);

  const { currentStyle, styleMap } = handleData(
    editorState,
    blogState,
    colorPickerInput
  );
  return (
    <div>
      <div style={{ display: !blogState.isLoading ? "block" : "none" }}>
        <div className="loading-save-content">
          <i className="fas fa-spinner fa-spin"></i> <span>Save</span>
        </div>
        <div
          className="unsaved-content"
          style={{
            display: blogState.toggleEditMode ? "block" : "none",
            backgroundColor: blogState.isSaved ? "green" : "red",
          }}
        >
          <span></span>
        </div>
        <div className="loading-publicize-content">
          <i className="fas fa-spinner fa-spin"></i> <span>Publicizing...</span>
        </div>
        {user &&
          ((blogState.dataBlogPage.userId === user.userId &&
            blogState.toggleEditMode) ||
            (postId === "create" && blogState.dataBlogPage.title)) && (
            <MenuController
              blogState={blogState}
              onChange={onChange}
              editorState={editorState}
              currentStyle={currentStyle}
            />
          )}
        <BlogContentDetail
          blogState={blogState}
          styleMap={styleMap}
          editorState={editorState}
          onChange={onChange}
          editorRef={editorRef}
          postId={postId}
        />
        {user &&
          (blogState.dataBlogPage.userId === user.userId ||
            (postId === "create" && blogState.dataBlogPage.title)) && (
            <div className="menu-control-fix">
              <button
                className="button-publicize-post"
                style={{
                  display:
                    !blogState.toggleEditMode && blogState.isCompleted !== true
                      ? "inline-block"
                      : "none",
                }}
              >
                Publish
              </button>

              {!blogState.isSaved && (
                <button
                  className="button-saved-post"
                  onClick={() => {
                    if (blogInputEditStream.currentState().toggleEditMode)
                      changeTriggerSave();
                  }}
                >
                  Saved
                </button>
              )}
              <button
                onClick={toggleStateEdit}
                className={
                  blogState.toggleEditMode === true
                    ? "edit-button-post--inactive"
                    : "edit-button-post"
                }
              >
                {blogState.toggleEditMode === true ? "Done" : "Edit"}
              </button>
            </div>
          )}
      </div>
      <div
        style={{
          display: blogState.isLoading ? "block" : "none",
          textAlign: "center",
        }}
      >
        <i className="fas fa-cog fa-spin fa-2x"></i>
      </div>
    </div>
  );
};

export default BlogInputEdit;

function BlogContentDetail({
  blogState,
  styleMap,
  editorState,
  onChange,
  editorRef,
  postId,
}) {
  return (
    <section className="section-blog-detail">
      <HeaderBlogPost
        title={blogState.dataBlogPage.title}
        excerpt={blogState.dataBlogPage.excerpt}
        tags={blogState.dataBlogPage.tags}
        updatedAt={blogState.dataBlogPage.updatedAt}
        user={blogState.dataBlogPage.user}
        post={blogState.dataBlogPage}
        postId={postId}
      />
      <Editor
        customStyleMap={styleMap}
        keyBindingFn={onKeyDown(editorState, onChange)}
        ref={editorRef}
        editorState={editorState}
        onChange={onChange}
        handleKeyCommand={handleKeyCommand(onChange)}
        handlePastedFiles={async (files) => {
          try {
            await uploadFile(files, editorState, onChange);
          } catch (error) {
            console.log(error);
          }
        }}
      />
    </section>
  );
}

function handleData(editorState, blogState, colorPickerInput) {
  const currentStyle = editorState.getCurrentInlineStyle();
  const styleMap = {
    CODE: {
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: "16px",
      padding: "2px",
      borderRadius: "4px",
      backgroundColor: "#e9e8e8",
      whiteSpace:"pre"
    },
    ...blogInputEditStream.currentState().alignStyleMap,
    ...blogInputEditStream.currentState().colorStyleMap,
  };
  const colorPicker = blogState.COLORS.find(({ style }) => {
    return currentStyle.has(style);
  });
  if (colorPickerInput)
    colorPickerInput.value = colorPicker
      ? styleMap[colorPicker.style].color
      : "#000000";
  return { currentStyle, styleMap };
}

function onKeyDown(editorState, onChange) {
  return (e) => {
    if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 83) {
      e.preventDefault();
      onChange(editorState);
      changeTriggerSave();
    }
    if (e.keyCode === 9) {
      const newEditorState = RichUtils.onTab(e, editorState, 4);
      if (newEditorState !== editorState) {
        onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };
}

function handleKeyCommand(onChange) {
  return (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (command === "split-block") {
      const scrollY = window.scrollY;
      setTimeout(() => {
        window.scroll({
          top: scrollY,
        });
      }, 0);
    }
    if (newState) {
      onChange(newState);
      return "handled";
    }
    return "not-handled";
  };
}
