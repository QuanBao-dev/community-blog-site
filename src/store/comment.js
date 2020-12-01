import { BehaviorSubject } from "rxjs";

const initialState = {
  comments: [],
  page: 1,
  lastPage: 1,
  triggerCommentUpdated: true,
  fetchedCommentId: [],
  isLoading: false,
};
const behaviorSubject = new BehaviorSubject(initialState);
let state = initialState;
const commentStore = {
  subscribe: (setState) => behaviorSubject.subscribe(setState),
  init: () => {
    behaviorSubject.next(state);
  },
  currentState: () => {
    let ans;
    behaviorSubject.subscribe((v) => (ans = v));
    return ans || initialState;
  },
  updateData: (object = initialState) => {
    state = {
      ...state,
      ...object,
    };
    behaviorSubject.next(state);
  },
};

export default commentStore;
