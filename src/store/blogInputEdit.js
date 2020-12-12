import { nanoid } from 'nanoid';
import { BehaviorSubject } from 'rxjs';

const initialState = {
  screenWidth: null,
  dataBlogPage: {
    body: "",
    title: "",
  },
  tags: [],
  isCompleted: null,
  listImageString: "[]",
  toggleEditMode: false,
  randomId: null,
  currentPostIdPath: null,
  isSaving: false,
  isPublicizing: false,
  triggerSave: false,
  isAutosaveMode: false,
  isSaved: true,
  bodySavedString: "",
  filterImageUrl: [],
  colorId: nanoid(),
  COLORS: [],
  colorStyleMap: {},
  colorStyleMapSavedString: "{}",
  triggerFetchBlog: true,
  isLoading:false
};
const behaviorSubject = new BehaviorSubject(initialState);
let state = initialState;
const blogInputEditStore = {
  subscribe: (setState) => behaviorSubject.subscribe(setState),
  init: () => {
    behaviorSubject.next(state);
  },
  currentState: () => {
    let ans;
    behaviorSubject.subscribe((v) => (ans = v));
    return ans || initialState;
  },
  updateData: (objectModified = initialState) => {
    state = {
      ...state,
      ...objectModified,
    };
    behaviorSubject.next(state);
  },
  updateDataQuick: (keyState, key, value) => {
    if (key) {
      state[keyState][key] = value;
    } else {
      state[keyState] = value;
    }
    // behaviorSubject.next(state);
  },
  updateBodyQuick: (body) => {
    state.dataBlogPage.body = body;
    behaviorSubject.next(state);
  },
  updateIsCompletedQuick: (bool) => {
    state.dataBlogPage.isCompleted = bool;
    behaviorSubject.next(state);
  },
  updateCOLORS: () => {
    let COLORS = [];
    Object.keys(blogInputEditStore.currentState().colorStyleMap).forEach(
      (key) => {
        COLORS.push({ style: key });
      }
    );
    blogInputEditStore.updateData({
      COLORS: COLORS,
    });
  },
};

export default blogInputEditStore;
