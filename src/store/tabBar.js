import { BehaviorSubject } from "rxjs";
const initialState = {
  tabMode: 1,
};
const behaviorSubject = new BehaviorSubject(initialState);
let state = initialState;
const tabBarStore = {
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

export default tabBarStore;
