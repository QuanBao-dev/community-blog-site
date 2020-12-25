import "./BlogInputEdit.css";
import "draft-js/dist/Draft.css";

import loadable from "@loadable/component";
import {
  CompositeDecorator,
  convertFromRaw,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils,
} from "draft-js";
import React, { useMemo, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import { userStream } from "../../epic/user";
import {
  changeTriggerSave,
  saveContent,
  uploadFile,
} from "../../Functions/blogInputEdit";
import {
  useAutoSave,
  useCheckPageSaved,
  useColorPickerChange,
  useFetchBlogData,
  useInitBlogDetail,
  useInitEditorContent,
  useSaveTrigger,
  useShowHidePublish,
  useShowHideSaving,
  useToggleEdit,
  useUpdateAfterFetch,
} from "../../Hook/blogInputEdit";

const AudioCustom = loadable(() => import("../AudioCustom/AudioCustom"));
const HeaderBlogPost = loadable(() =>
  import("../HeaderBlogPost/HeaderBlogPost")
);
const Media = loadable(() => import("../Media/Media"));
const LinkCustom = loadable(() => import("../LinkCustom/LinkCustom"));
const MenuController = loadable(() =>
  import("../MenuController/MenuController")
);
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

  useToggleEdit(blogState);
  useShowHidePublish(blogState);
  useShowHideSaving(blogState);
  useUpdateAfterFetch(editorState, onChange, blogState);
  useCheckPageSaved(blogState, editorState);
  useColorPickerChange(colorPickerInput, editorState, onChange);
  const { currentStyle, styleMap } = useMemo(
    handleData(editorState, blogState, colorPickerInput),
    [editorState]
  );
  const editorBlog = document.querySelector(".editor-blog");
  if (editorBlog) {
    editorBlog.style.backgroundColor = userStream.currentState().isDarkMode
      ? "black"
      : "white";
    editorBlog.style.color = !userStream.currentState().isDarkMode
      ? "black"
      : "white";
  }
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
          <i className="fas fa-spinner fa-spin"></i>
          <span>Publishing...</span>
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
    <section
      className={`section-blog-detail${
        userStream.currentState().isDarkMode ? " dark" : ""
      }`}
    >
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
  return () => {
    const currentStyle = editorState.getCurrentInlineStyle();
    const styleMap = {
      CODE: {
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: "16px",
        padding: "2px",
        borderRadius: "4px",
        color: "black",
        backgroundColor: "#e9e8e8",
        whiteSpace: "pre",
        margin:"0 5px"
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
  };
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
