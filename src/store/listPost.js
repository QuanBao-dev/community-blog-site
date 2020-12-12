import { BehaviorSubject } from "rxjs";
const initialState = {
  listPost: [],
  currentPage: 1,
  isStopFetching: false,
  isStillFetchingWhenScrolling: false,
  latestPageFetched: null,
  latestTabMode: null,
  latestTagId: null,
  latestUserId: null,
  latestTitle: null,
  tagId: "",
  title: null,
  userId: null,
};
const behaviorSubject = new BehaviorSubject(null);
const behaviorSubjectPrev = new BehaviorSubject(initialState);
const payLoadChange = new BehaviorSubject();
let state = initialState;
const listPostStore = {
  subscribe: (setState) => behaviorSubject.subscribe(setState),
  init: () => {
    behaviorSubject.next(state);
  },
  debug: () => {
    console.log({
      "0.payload": listPostStore.payloadChangeState(),
      "1.previous": listPostStore.previousState(),
      "2.current": listPostStore.currentState(),
    });
  },
  previousState: () => {
    let ans;
    behaviorSubjectPrev.subscribe((v) => (ans = v));
    return ans || initialState;
  },
  payloadChangeState: () => {
    let ans;
    payLoadChange.subscribe((v) => (ans = v));
    return ans || initialState;
  },
  currentState: () => {
    let ans;
    behaviorSubject.subscribe((v) => (ans = v));
    return ans || initialState;
  },
  updateData: (objectModified = initialState) => {
    payLoadChange.next({ ...objectModified });
    behaviorSubjectPrev.next(state);
    state = {
      ...state,
      ...objectModified,
    };
    behaviorSubject.next(state);
  },
  updateDataQuick: (data = initialState) => {
    const keys = Object.keys(data);
    keys.forEach((key) => {
      state[key] = data[key];
    });
  },
};

export default listPostStore;
