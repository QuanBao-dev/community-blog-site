import './App.css';

import loadable from '@loadable/component';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { timer } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { pluck, switchMapTo, takeWhile } from 'rxjs/operators';

import NavBar from './components/NavBar/NavBar';
import { fetchUser$, userStream } from './epic/user';

const Blog = loadable(() => import("./pages/Blog/Blog"));
const Home = loadable(() => import("./pages/Home/Home"));
const Login = loadable(() => import("./pages/Login/Login"));
const NotFound = loadable(() => import("./pages/NotFound/NotFound"));
const Register = loadable(() => import("./pages/Register/Register"));
const SearchPosts = loadable(() => import("./pages/SearchPosts/SearchPosts"));
const TagId = loadable(() => import("./pages/TagId/TagId"));
const Tags = loadable(() => import("./pages/Tags/Tags"));
const UserCompletedPosts = loadable(() =>
  import("./pages/UserCompletedPosts/UserCompletedPosts")
);
const EditAccount = loadable(() => import("./pages/EditAccount/EditAccount"));
window.addEventListener("resize", () => {
  userStream.updateData({ screenWidth: window.innerWidth });
});
function App() {
  const [userState, setUserState] = useState(userStream.currentState());
  const [cookies, , removeCookie] = useCookies(["idBloggerUser"]);
  const history = useHistory();
  useEffect(() => {
    const subscription = userStream.subscribe(setUserState);
    userStream.init();
    userStream.updateData({ screenWidth: window.innerWidth });
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
          screenWidth={userState.screenWidth}
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
