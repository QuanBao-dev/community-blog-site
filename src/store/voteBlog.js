import { BehaviorSubject } from "rxjs";

const initialState = {
  downVotesUserIdList: [],
  upVotesUserIdList: [],
};
const behaviorSubject = new BehaviorSubject(initialState);
let state = initialState;
const voteBlogStore = {
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

export default voteBlogStore;
