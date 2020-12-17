import "./MenuController.css";

import { AtomicBlockUtils, RichUtils } from "draft-js";
import React from "react";

import { blogInputEditStream } from "../../epic/blogInputEdit";
import {
  applyInlineStyleMap,
  changeTriggerSave,
  createNewCustomBlock,
  uploadFile,
} from "../../Functions/blogInputEdit";

const BLOCK_STYLES = [
  { label: "h1", style: "header-one" },
  { label: "h2", style: "header-two" },
  { label: "h3", style: "header-three" },
  { label: "h4", style: "header-four" },
  { label: "h5", style: "header-five" },
  { label: "h6", style: "header-six" },
  { label: "UL", style: "unordered-list-item" },
  { label: "OL", style: "ordered-list-item" },
  { label: "pre", style: "code-block" },
  { label: "blockquote", style: "blockquote" },
];
const INLINE_STYLES = [
  { label: "Monospace", style: "CODE" },
  { label: "Bold", style: "BOLD" },
  { label: "Italic", style: "ITALIC" },
];

const TEXT_ALIGN = [
  { label: "CENTER", style: "CENTER" },
  { label: "LEFT", style: "LEFT" },
  { label: "RIGHT", style: "RIGHT" },
];

function MenuController({ blogState, onChange, editorState, currentStyle }) {
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(editorState.getSelection().getAnchorKey())
    .getType();
  const createNewImage = () => {
    if (!blogState.toggleEditMode) {
      return;
    }
    const inputImage = document.querySelector(".input-image-text");
    const url = inputImage.value.trim();
    const { newEditorState, entityKey } = createNewCustomBlock(
      editorState,
      "PHOTO",
      "IMMUTABLE",
      {
        url,
        className: "text-align-center",
      }
    );
    onChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
    inputImage.value = "";
    if (blogInputEditStream.currentState().isAutosaveMode) changeTriggerSave();
  };

  const createNewIframe = (e) => {
    e.preventDefault();
    if (!blogState.toggleEditMode) {
      return;
    }
    const inputIframe = document.querySelector(".input-iframe-text");
    const { newEditorState, entityKey } = createNewCustomBlock(
      editorState,
      "PHOTO",
      "IMMUTABLE",
      {
        url: inputIframe.value.trim(),
        className: "text-align-center",
        isImage: false,
      }
    );
    onChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
    if (blogInputEditStream.currentState().isAutosaveMode) changeTriggerSave();
    inputIframe.value = "";
  };
  const createChosenFileImage = async (e) => {
    if (!blogInputEditStream.currentState().toggleEditMode) {
      return;
    }
    try {
      const files = e.target.files;
      if (files[0].type.includes("image"))
        await uploadFile(files, editorState, onChange);
      else {
        alert("Require Image file");
      }
      document.getElementById("change-file-image-input").value = "";
    } catch (error) {
      console.log(error);
    }
    if (blogInputEditStream.currentState().isAutosaveMode) changeTriggerSave();
  };
  const applyLink = (e) => {
    e.preventDefault();
    if (blogInputEditStream.currentState().toggleEditMode) {
      const inputLink = document.querySelector(".input-link-text");
      const { newEditorState, entityKey } = createNewCustomBlock(
        editorState,
        "LINK",
        "MUTABLE",
        {
          url: inputLink.value.trim(),
        }
      );
      onChange(
        RichUtils.toggleLink(
          newEditorState,
          newEditorState.getSelection(),
          entityKey,
          " "
        )
      );
      inputLink.value = "";
      if (blogInputEditStream.currentState().isAutosaveMode)
        changeTriggerSave();
    }
  };
  const toggleAutosaveMode = () => {
    blogInputEditStream.updateData({
      isAutosaveMode: !blogState.isAutosaveMode,
    });
    if (
      blogInputEditStream.currentState().isAutosaveMode &&
      !blogInputEditStream.currentState().isSaved
    ) {
      changeTriggerSave();
    }
  };
  const createNewAudio = (e) => {
    e.preventDefault();
    const audioInput = document.querySelector(".input-audio-text");
    const { newEditorState, entityKey } = createNewCustomBlock(
      editorState,
      "AUDIO",
      "IMMUTABLE",
      {
        url: audioInput.value,
        className: "text-align-center",
      }
    );
    onChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
    if (blogInputEditStream.currentState().isAutosaveMode) changeTriggerSave();
  };
  return (
    <div className="control-menu-container">
      <button
        className={blogState.isAutosaveMode ? "autosave-button-active" : ""}
        onClick={toggleAutosaveMode}
      >
        autosave
      </button>
      <input
        type="file"
        id="change-file-image-input"
        onChange={createChosenFileImage}
        onMouseDown={(e) => e.preventDefault()}
      />

      <input
        type="text"
        placeholder="ENTER IFRAME URL"
        className="input-iframe-text"
      />
      <button onMouseDown={createNewIframe}>Confirm</button>

      <input
        type="text"
        placeholder="ENTER IMAGE URL"
        className="input-image-text"
      />
      <button onMouseDown={createNewImage}>Confirm</button>

      <input
        type="text"
        placeholder="ENTER URL AUDIO"
        className="input-audio-text"
      />
      <button onMouseDown={createNewAudio}>Confirm</button>
      <ListButtonChangeBlockStyle
        blockType={blockType}
        onChange={onChange}
        editorState={editorState}
      />
      <ListButtonChangeInlineStyle
        currentStyle={currentStyle}
        onChange={onChange}
        editorState={editorState}
      />
      <input
        className="color-picker-input"
        type="color"
        title="Enter to select"
        onMouseDown={(e) => e.preventDefault()}
      />
      <input
        type="text"
        placeholder="ENTER LINK TEXT"
        className="input-link-text"
      />
      <button onMouseDown={applyLink}>Confirm</button>
      <div>
        {TEXT_ALIGN.map((type, index) => (
          <button
            className={`${currentStyle.has(type.style) ? "active-button" : ""}`}
            key={index}
            onMouseDown={applyInlineStyleMap(
              editorState,
              blogInputEditStream.currentState().alignStyleMap,
              type,
              onChange,
              true
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuController;
function ListButtonChangeBlockStyle({ blockType, onChange, editorState }) {
  return (
    <div>
      {BLOCK_STYLES.map((type, index) => (
        <button
          className={`${blockType === type.style ? "active-button" : ""}`}
          key={index}
          onMouseDown={(e) => {
            e.preventDefault();
            if (blogInputEditStream.currentState().toggleEditMode) {
              onChange(RichUtils.toggleBlockType(editorState, type.style));
              applyInlineStyleMap(editorState);
              if (blogInputEditStream.currentState().isAutosaveMode)
                changeTriggerSave();
            }
          }}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

function ListButtonChangeInlineStyle({ currentStyle, onChange, editorState }) {
  return (
    <div>
      {INLINE_STYLES.map((type, index) => (
        <button
          className={`${currentStyle.has(type.style) ? "active-button" : ""}`}
          key={index}
          onMouseDown={(e) => {
            e.preventDefault();
            if (blogInputEditStream.currentState().toggleEditMode) {
              onChange(RichUtils.toggleInlineStyle(editorState, type.style));
              if (blogInputEditStream.currentState().isAutosaveMode)
                changeTriggerSave();
            }
          }}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
