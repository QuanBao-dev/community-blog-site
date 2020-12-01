import { BehaviorSubject } from "rxjs";
const initialState = {
  topPopularTags:[],
  triggerFetchTags:false,
};
const behaviorSubject = new BehaviorSubject(initialState);
let state = initialState;
const popularTagsStore = {
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
};

export default popularTagsStore;
