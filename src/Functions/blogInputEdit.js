import {
  AtomicBlockUtils,
  convertFromRaw,
  convertToRaw,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import { nanoid } from "nanoid";
import { fromEvent } from "rxjs";

import {
  autosave$,
  blogInputEditStream,
  fetchBlog$,
  fetchValidateImageList$,
  handleColorPickerChange$,
  publicizePost$,
  triggerSaveData$,
} from "../epic/blogInputEdit";
import { latestPostsStream } from "../epic/latestPosts";
import { listPostStream } from "../epic/listPost";
import { tabBarStream } from "../epic/tabBar";
import { userStream } from "../epic/user";

export function initEditorContent(
  postId,
  blogState,
  cookies,
  onChange,
  convertFromRaw,
  decorator
) {
  return () => {
    if (postId === "create") {
      blogInputEditStream.updateData({
        toggleEditMode: true,
      });
    }
    if (blogState.dataBlogPage.body) {
      let content = "";
      if (typeof blogState.dataBlogPage.body !== "string") {
        content = JSON.stringify(blogState.dataBlogPage.body);
      } else {
        content = blogState.dataBlogPage.body;
      }
      blogInputEditStream.updateData({
        bodySavedString: content,
      });
      fetchValidateImageList$(cookies, postId).subscribe(() => {
        if (blogInputEditStream.currentState().dataBlogPage.title === "")
          blogInputEditStream.updateData({
            triggerFetchBlog: !blogInputEditStream.currentState()
              .triggerFetchBlog,
          });
      });
      if (content) {
        onChange(
          EditorState.createWithContent(
            convertFromRaw(JSON.parse(content)),
            decorator
          )
        );
      }
    }
  };
}

export function initBlogDetail(onChange, decorator, setBlogState) {
  return () => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
    const subscription = blogInputEditStream.subscribe(setBlogState);
    const subscription2 = fromEvent(
      document.querySelector(".public-DraftEditor-content"),
      "click"
    ).subscribe(() => {
      blogInputEditStream.updateDataQuick("colorId", null, nanoid());
    });
    blogInputEditStream.init();
    return () => {
      if (blogInputEditStream.currentState().currentPostIdPath === "create") {
        blogInputEditStream.updateBodyQuick(
          `{"blocks":[{"key":"funpc","text":"Ctrl+s to save blog","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
        );
        onChange(
          EditorState.createWithContent(
            convertFromRaw(
              JSON.parse(
                `{"blocks":[{"key":"funpc","text":"Ctrl+s to save blog","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
              )
            )
          )
        );
      } else onChange(EditorState.createEmpty(decorator));
      subscription.unsubscribe();
      subscription2.unsubscribe();
      latestPostsStream.updateData({
        authorId: null,
        shouldFetchLatestPostAuthor: true,
      });
      if (blogInputEditStream.currentState().currentPostIdPath !== "create")
        blogInputEditStream.updateData({
          dataBlogPage: {
            body: "",
            title: "",
          },
          toggleEditMode: false,
          isSaving: false,
          isAutosaveMode: false,
          listImageString: "[]",
          isPublicizing: false,
          filterImageUrl: [],
        });
    };
  };
}

export function colorPickerChange(colorPickerInput, editorState, onChange) {
  return () => {
    let subscription;
    if (colorPickerInput) {
      subscription = handleColorPickerChange$(
        colorPickerInput,
        editorState,
        onChange
      );
    }
    return () => {
      subscription && subscription.unsubscribe();
    };
  };
}

export function autosave(cookies, history) {
  return () => {
    const subscription = autosave$(cookies).subscribe((v) => {
      if (!v.error) {
        updateLatestPost(v);
        const data = { ...v };
        if (blogInputEditStream.currentState().currentPostIdPath === "create") {
          blogInputEditStream.updateData({
            currentPostIdPath: blogInputEditStream.currentState().randomId,
            isLoading: false,
          });
          blogInputEditStream.updateData({
            toggleEditMode: true,
          });
          history.replace(
            "/blog/" + blogInputEditStream.currentState().randomId
          );
        }
        blogInputEditStream.updateData({
          isCompleted: false,
          listImageString: v.listImageString || "[]",
        });
        delete data.body;
        if (
          listPostStream.currentState().listPost[0] &&
          listPostStream.currentState().listPost[0].postId !== data.postId
        ) {
          const updatedList = listPostStream
            .currentState()
            .listPost.filter((post) => post.postId !== data.postId);
          listPostStream.updateData({
            listPost: [data, ...updatedList],
          });
        }
        if (tabBarStream.currentState().tabMode !== 3) {
          const updatedList = listPostStream
            .currentState()
            .listPost.filter((post) => post.postId !== v.postId);
          listPostStream.updateData({
            listPost: updatedList,
          });
        } else {
          if (listPostStream.currentState().listPost.length === 0)
            listPostStream.updateData({
              listPost: [data],
            });
        }
      } else {
        if (v.error === "Access denied" || v.error === "Invalid token") {
          userStream.updateData({
            user: null,
            quantityUser: null,
            isDoneFetch: false,
          });
          alert("Please refresh and sign in");
        }
      }
      blogInputEditStream.updateData({ isSaving: false });
    });
    return () => {
      subscription.unsubscribe();
    };
  };
}

export function saveTrigger(cookies, history) {
  return () => {
    // console.log("Save trigger", blogInputEditStream.currentState());
    if (blogInputEditStream.currentState().toggleEditMode) {
      triggerSaveData$(cookies).subscribe((v) => {
        if (!v.error) {
          updateLatestPost(v);
          const data = { ...v };
          if (
            blogInputEditStream.currentState().currentPostIdPath === "create"
          ) {
            blogInputEditStream.updateData({
              currentPostIdPath: blogInputEditStream.currentState().randomId,
              isLoading: false,
            });
            blogInputEditStream.updateData({
              toggleEditMode: true,
            });
            history.replace(
              "/blog/" + blogInputEditStream.currentState().randomId
            );
          }
          blogInputEditStream.updateData({
            isCompleted: false,
            listImageString: v.listImageString || "[]",
          });
          delete data.body;
          if (
            listPostStream.currentState().listPost[0] &&
            listPostStream.currentState().listPost[0].postId !== data.postId
          ) {
            const updatedList = listPostStream
              .currentState()
              .listPost.filter((post) => post.postId !== data.postId);
            listPostStream.updateData({
              listPost: [data, ...updatedList],
            });
          }
          if (tabBarStream.currentState().tabMode !== 3) {
            const updatedList = listPostStream
              .currentState()
              .listPost.filter((post) => post.postId !== v.postId);
            listPostStream.updateData({
              listPost: updatedList,
            });
          } else {
            if (listPostStream.currentState().listPost.length === 0)
              listPostStream.updateData({
                listPost: [data],
              });
          }
        } else {
          if (v.error === "Access denied" || v.error === "Invalid token") {
            userStream.updateData({
              user: null,
              quantityUser: null,
              isDoneFetch: false,
            });
            alert("Please refresh and sign in");
          }
        }
        blogInputEditStream.updateData({ isSaving: false });
      });
    }
  };
}

export function publishPost(buttonUpload, cookies, history) {
  return () => {
    let publicizePostSub;
    if (buttonUpload)
      publicizePostSub = publicizePost$(buttonUpload, cookies).subscribe(
        (v) => {
          if (!v.error) {
            updateLatestPost(v, true);
            const data = { ...v };
            if (
              blogInputEditStream.currentState().currentPostIdPath === "create"
            ) {
              blogInputEditStream.updateData({
                currentPostIdPath: blogInputEditStream.currentState().randomId,
              });
              blogInputEditStream.updateData({
                toggleEditMode: true,
              });
              history.replace(
                "/blog/" + blogInputEditStream.currentState().randomId
              );
            }
            blogInputEditStream.updateData({
              isCompleted: true,
              listImageString: v.listImageString || "[]",
              isPublicizing: false,
            });
            latestPostsStream.updateData({ shouldFetchLatestPost: true });
            delete data.body;
            if (tabBarStream.currentState().tabMode !== 2) {
              tabBarStream.updateData({ tabMode: 2 });
              listPostStream.updateData({
                isStopFetching: false,
                isStillFetchingWhenScrolling: true,
              });
            } else {
              const updatedList = listPostStream
                .currentState()
                .listPost.filter((post) => post.postId !== data.postId);
              listPostStream.updateData({
                listPost: [data, ...updatedList],
              });
            }
          } else {
            if (v.error === "Access denied" || v.error === "Invalid token") {
              userStream.updateData({
                user: null,
                quantityUser: null,
                isDoneFetch: false,
              });
              alert("Please refresh and sign in");
            }
          }
          blogInputEditStream.updateData({ isPublicizing: false });
        }
      );
    return () => {
      publicizePostSub && publicizePostSub.unsubscribe();
    };
  };
}

function updateLatestPost(v, isPublish) {
  const listPostId = latestPostsStream
    .currentState()
    .latestPost.map((post) => post.postId);
  const listPostAuthorPostId = latestPostsStream
    .currentState()
    .latestPostAuthor.map((post) => post.postId);
  if (isPublish) {
    if (!listPostId.includes(v.postId)) {
      latestPostsStream.updateData({ shouldFetchLatestPost: true });
    }
    if (!listPostAuthorPostId.includes(v.postId)) {
      latestPostsStream.updateData({
        shouldFetchLatestPostAuthor: true,
      });
    }
  } else {
    if (listPostId.includes(v.postId)) {
      latestPostsStream.updateData({ shouldFetchLatestPost: true });
    }
    if (listPostAuthorPostId.includes(v.postId)) {
      latestPostsStream.updateData({
        shouldFetchLatestPostAuthor: true,
      });
    }
  }
}

export function fetchBlogData(postId, onChange, decorator, history) {
  return () => {
    blogInputEditStream.updateData({ currentPostIdPath: postId });
    if (postId === "create") {
      const id = nanoid();
      blogInputEditStream.updateData({ randomId: id });
    }

    const subscription = fetchBlog$(postId).subscribe((data) => {
      blogInputEditStream.updateData({ isLoading: false });
      if (!data.error) {
        latestPostsStream.updateData({ authorId: data.userId });
        blogInputEditStream.updateData({
          isCompleted: data.isCompleted,
          dataBlogPage: data,
          listImageString: data.listImageString || "[]",
          colorStyleMap: JSON.parse(data.colorStyleMapString || "{}"),
          colorStyleMapSavedString: data.colorStyleMapString || "{}",
        });
        blogInputEditStream.updateCOLORS();
      } else {
        if (blogInputEditStream.currentState().currentPostIdPath === "create") {
          blogInputEditStream.updateBodyQuick(
            `{"blocks":[{"key":"funpc","text":"Ctrl+s to save blog","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          );
          onChange(
            EditorState.createWithContent(
              convertFromRaw(
                JSON.parse(
                  `{"blocks":[{"key":"funpc","text":"Ctrl+s to save blog","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
                )
              )
            )
          );
        } else onChange(EditorState.createEmpty(decorator));
        if (
          postId === "create" &&
          blogInputEditStream.currentState().dataBlogPage.title === ""
        ) {
          history.replace("/");
        } else {
          if (postId !== "create") history.replace("/");
        }
      }
    });
    return () => {
      if (postId === "create") {
        blogInputEditStream.updateData({ isLoading: false });
      } else {
        blogInputEditStream.updateData({ isLoading: true });
      }
      subscription.unsubscribe();
    };
  };
}

export function checkPageSaved(blogState) {
  return () => {
    blogInputEditStream.updateData({
      isSaved:
        blogState.bodySavedString === blogState.dataBlogPage.body &&
        JSON.stringify(blogState.colorStyleMap) ===
          blogState.colorStyleMapSavedString,
    });
  };
}

export function updateAfterFetch(editorState, onChange) {
  return () => {
    const rawBody = convertToRaw(editorState.getCurrentContent());
    if (Object.keys(rawBody.entityMap).length > 0) {
      onChange(editorState);
    }
  };
}

export function showHideSaving(blogState) {
  return () => {
    const loading = document.querySelector(".loading-save-content");
    if (blogState.isSaving) {
      loading.style.display = "block";
    } else {
      loading.style.display = "none";
    }
  };
}

export function showHidePublish(blogState) {
  return () => {
    const loading = document.querySelector(".loading-publicize-content");
    if (loading) {
      if (blogState.isPublicizing) {
        loading.style.display = "block";
      } else {
        loading.style.display = "none";
      }
    }
  };
}

export function toggleEdit(blogState) {
  return () => {
    const divTextArea = document.querySelector(".public-DraftEditor-content");
    divTextArea.contentEditable = blogState.toggleEditMode;
  };
}

export function changeTriggerSave() {
  if (blogInputEditStream.currentState().toggleEditMode) {
    blogInputEditStream.updateData({
      triggerSave: !blogInputEditStream.currentState().triggerSave,
    });
  }
}

export function toggleStateEdit() {
  blogInputEditStream.updateData({
    toggleEditMode: !blogInputEditStream.currentState().toggleEditMode,
  });
}

export function createNewCustomBlock(editorState, tag, mutability, data) {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    tag,
    mutability,
    data
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(editorState, {
    currentContent: contentStateWithEntity,
  });
  return { newEditorState, entityKey };
}

export async function uploadFile(files, editorState, onChange) {
  const url = await convertToUri(files[0]);
  const tag = "PHOTO";
  const mutability = "IMMUTABLE";
  const data = { url, className: "text-align-center", isImage: true };
  const { newEditorState, entityKey } = createNewCustomBlock(
    editorState,
    tag,
    mutability,
    data
  );
  onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " "));
}

function convertToUri(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (fileContent) => {
      res(fileContent.target.result);
    };
    reader.readAsDataURL(file);
  });
}

export const saveContent = (content) => {
  const rawBody = convertToRaw(content);
  const listImage = JSON.parse(
    blogInputEditStream.currentState().listImageString
  );
  let listAvailableImage;
  Object.keys(rawBody.entityMap).forEach((key) => {
    if (
      rawBody.entityMap[key].data &&
      rawBody.entityMap[key].data.url &&
      rawBody.entityMap[key].type === "PHOTO" &&
      rawBody.entityMap[key].data.url.match(
        /https:\/\/res.cloudinary.com\/storagecloud\/image\/upload\/v[0-9]+\/web-blog\/post-user\/[a-zA-Z0-9:/;,+=@#$%^&*\\\-_]+.(jpg|png|gif)/
      )
    ) {
      if (!listAvailableImage)
        listAvailableImage = [rawBody.entityMap[key].data.url];
      else listAvailableImage.push(rawBody.entityMap[key].data.url);
    }
  });
  if (listAvailableImage) {
    listAvailableImage.forEach((url) => {
      if (!blogInputEditStream.currentState().filterImageUrl.includes(url)) {
        blogInputEditStream.updateData({
          filterImageUrl: [
            ...blogInputEditStream.currentState().filterImageUrl,
            url,
          ],
        });
      }
    });
  }
  const keys = Object.keys(rawBody.entityMap);
  let k = 0;
  for (let i = 0; i < keys.length; i++) {
    if (
      rawBody.entityMap[keys[i]].data &&
      rawBody.entityMap[keys[i]].data.url &&
      rawBody.entityMap[keys[i]].type === "PHOTO" &&
      listImage[k] &&
      !blogInputEditStream
        .currentState()
        .filterImageUrl.includes(listImage[k]) &&
      rawBody.entityMap[keys[i]].data.url.match(
        /data:image\/[a-zA-Z0-9:/;,+=@#$%^&*\\]+/
      )
    ) {
      rawBody.entityMap[keys[i]].data.url = listImage[k];
      blogInputEditStream.updateData({
        bodySavedString: JSON.stringify(rawBody),
      });
      k++;
    } else if (
      rawBody.entityMap[keys[i]].data &&
      rawBody.entityMap[keys[i]].data.url &&
      rawBody.entityMap[keys[i]].data.url.match(
        /https:\/\/res.cloudinary.com\/storagecloud\/image\/upload\/v[0-9]+\/web-blog\/post-user\/[a-zA-Z0-9:/;,+=@#$%^&*\\\-_]+.(jpg|png|gif)/
      )
    ) {
      k++;
    }
  }
  const body = JSON.stringify(rawBody);
  blogInputEditStream.updateBodyQuick(body);
};

export function applyInlineStyleMap(
  editorState,
  styleMap,
  type,
  onChange,
  isNotColor
) {
  return (e) => {
    e.preventDefault();
    if (blogInputEditStream.currentState().toggleEditMode) {
      const selection = editorState.getSelection();
      const nextContentState = Object.keys(styleMap).reduce(
        (contentState, color) => {
          return Modifier.removeInlineStyle(contentState, selection, color);
        },
        editorState.getCurrentContent()
      );
      let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        "change-inline-style"
      );
      const currentStyle = editorState.getCurrentInlineStyle();
      if (!isNotColor)
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
      if (isNotColor)
        if (!currentStyle.has(type.style)) {
          nextEditorState = RichUtils.toggleInlineStyle(
            nextEditorState,
            type.style
          );
        }
      onChange(nextEditorState);
      if (blogInputEditStream.currentState().isAutosaveMode)
        changeTriggerSave();
    }
  };
}
