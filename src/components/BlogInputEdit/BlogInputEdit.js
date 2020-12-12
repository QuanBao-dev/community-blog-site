import "./BlogInputEdit.css";
import "draft-js/dist/Draft.css";

import {
  CompositeDecorator,
  convertFromRaw,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
  RichUtils,
} from "draft-js";
import React, { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useHistory } from "react-router-dom";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import { userStream } from "../../epic/user";
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
import {
  changeTriggerSave,
  saveContent,
  toggleStateEdit,
  uploadFile,
} from "../../Functions/blogInputEdit";
import AudioCustom from "../AudioCustom/AudioCustom";
import ImageMedia from "../ImageMedia/ImageMedia";
import LinkCustom from "../LinkCustom/LinkCustom";
import MenuController from "../MenuController/MenuController";

window.addEventListener("resize", () => {
  blogInputEditStream.updateData({ screenWidth: window.innerWidth });
});
blogInputEditStream.updateData({ screenWidth: window.innerWidth });

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
function findImageMediaEntities(contentBlock, callback, contentState) {
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
    strategy: findImageMediaEntities,
    component: ImageMedia,
  },
  {
    strategy: findAudioEntities,
    component: AudioCustom,
  },
]);

const BlogInputEdit = ({ postId }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
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

  useInitBlogDetail(postId, onChange, decorator, setBlogState, cookies);
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
  usePublishPost(buttonUpload, cookies, history);

  useToggleEdit(blogState);
  useShowHidePublish(blogState);
  useShowHideSaving(blogState);
  useUpdateAfterFetch(editorState, onChange, blogState);
  useCheckPageSaved(blogState, editorState);
  useColorPickerChange(
    colorPickerInput,
    editorState,
    onChange,
    applyColorInlineStyle
  );

  const { currentStyle, styleMap } = handleData(
    editorState,
    blogState,
    colorPickerInput
  );
  return (
    <div>
      <div
        style={{
          display: !blogState.isLoading ? "block" : "none",
        }}
      >
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
          (blogState.dataBlogPage.userId === user.userId ||
            (postId === "create" && blogState.dataBlogPage.title)) && (
            <div className="menu-control-fix">
              {blogState.isCompleted !== true && (
                <button className="button-publicize-post">Upload Post</button>
              )}
              <button
                onClick={toggleStateEdit}
                className={
                  blogState.toggleEditMode === true
                    ? "edit-button-post--inactive"
                    : "edit-button-post"
                }
              >
                {blogState.toggleEditMode === true ? "No Edit" : "Edit"}
              </button>
            </div>
          )}
        {user &&
          (blogState.dataBlogPage.userId === user.userId ||
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
        />
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
}) {
  return (
    <section className="section-blog-detail">
      <div className="header-blog-post">
        <h1>{blogState.dataBlogPage.title}</h1>
        {blogState.dataBlogPage.tags && (
          <div>
            {blogState.dataBlogPage.tags.map((tag, key) => (
              <Link
                to={"/tags/" + tag.tagId}
                key={key}
                className="header-blog-post__tag-name"
              >
                #{tag.tagName || tag}
              </Link>
            ))}
          </div>
        )}
        {blogState.dataBlogPage.user && (
          <Link
            to={"/posts/user/" + blogState.dataBlogPage.user.userId}
            className="header-blog-post__author-username"
          >
            {blogState.dataBlogPage.user.username}
          </Link>
        )}
        {blogState.dataBlogPage && blogState.dataBlogPage.updatedAt && (
          <span className="header-blog-post__date-updated">
            {new Date(blogState.dataBlogPage.updatedAt).toUTCString()}
          </span>
        )}
        <div className="header-blog-post__excerpt-post">
          {blogState.dataBlogPage.excerpt}
        </div>
      </div>
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
      fontSize: 16,
      padding: 2,
    },
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

function applyColorInlineStyle(editorState, type, onChange) {
  return (e) => {
    e.preventDefault();
    if (blogInputEditStream.currentState().toggleEditMode) {
      const selection = editorState.getSelection();
      const nextContentState = Object.keys(
        blogInputEditStream.currentState().colorStyleMap
      ).reduce((contentState, color) => {
        return Modifier.removeInlineStyle(contentState, selection, color);
      }, editorState.getCurrentContent());
      let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        "change-inline-style"
      );
      const currentStyle = editorState.getCurrentInlineStyle();
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        type.style
      );
      // console.log(convertToRaw(nextEditorState));
      if (selection.isCollapsed()) {
        nextEditorState = currentStyle.reduce((state, color) => {
          return RichUtils.toggleInlineStyle(state, color);
        }, nextEditorState);
      }
      // If the color is being toggled on, apply it.

      onChange(nextEditorState);
      if (blogInputEditStream.currentState().isAutosaveMode)
        changeTriggerSave();
    }
  };
}

function handleKeyCommand(onChange) {
  return (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return "handled";
    }
    return "not-handled";
  };
}
