import "./App.css";

import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import { timer } from "rxjs";
import { ajax } from "rxjs/ajax";
import { pluck, switchMapTo, takeWhile } from "rxjs/operators";

import NavBar from "./components/NavBar/NavBar";
import { fetchUser$, userStream } from "./epic/user";
import Blog from "./pages/Blog/Blog";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import NotFound from "./pages/NotFound/NotFound";
import Register from "./pages/Register/Register";
import SearchPosts from "./pages/SearchPosts/SearchPosts";
import TagId from "./pages/TagId/TagId";
import Tags from "./pages/Tags/Tags";
import UserCompletedPosts from "./pages/UserCompletedPosts/UserCompletedPosts";
import EditAccount from "./pages/EditAccount/EditAccount";

function App() {
  const [userState, setUserState] = useState(userStream.currentState());
  const [cookies, , removeCookie] = useCookies(["idCartoonUser"]);
  const history = useHistory();
  useEffect(() => {
    const subscription = userStream.subscribe(setUserState);
    userStream.init();
    const fetchUserSub = fetchUser$(cookies).subscribe((user) => {
      if (!user.error) {
        userStream.updateData({ user });
      } else {
        userStream.updateData({ user: null });
      }
      userStream.updateData({ isDoneFetch: true });
    });
    return () => {
      subscription.unsubscribe();
      fetchUserSub.unsubscribe();
    };
  }, [cookies]);

  useEffect(() => {
    const subscription = timer(0)
      .pipe(
        takeWhile(() => userState.quantityUser === null),
        switchMapTo(ajax("/api/users").pipe(pluck("response", "message")))
      )
      .subscribe((v) => {
        userStream.updateData({ quantityUser: v });
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Router history={history}>
      <div className="App">
        <NavBar
          userState={userState}
          removeCookie={removeCookie}
          cookies={cookies}
        />
        <Switch>
          <Route component={Home} path="/" exact />
          <Route component={EditAccount} path="/account/edit" />
          <Route component={UserCompletedPosts} path="/posts/user/:userId" />
          <Route component={SearchPosts} path="/posts/search/:title" />
          <Route component={TagId} path="/tags/:tagId" />
          <Route component={Tags} path="/tags" />
          <Route component={Blog} path="/blog/:postId" />
          <Route component={Login} path="/auth/login" />
          <Route component={Register} path="/auth/register" />
          <Route component={NotFound} path="/*" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
