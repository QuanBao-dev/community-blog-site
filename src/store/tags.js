import { BehaviorSubject } from "rxjs";
const initialState = {
  tagData: [],
  currentPage: 1,
  maxPage: 1,
};
const behaviorSubject = new BehaviorSubject(initialState);
let state = initialState;
const tagStore = {
  subscribe: (setState) => behaviorSubject.subscribe(setState),
  init: () => {
    behaviorSubject.next(state);
  },
  currentState: () => {
    let ans;
    behaviorSubject.subscribe((v) => (ans = v));
    return ans || initialState;
  },
  updateData: 
  (objectModified = initialState) => {
    state = {
      ...state,
      ...objectModified,
    };
    behaviorSubject.next(state);
  },
};

export default tagStore;
