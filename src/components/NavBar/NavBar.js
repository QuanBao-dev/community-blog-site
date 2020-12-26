import "./NavBar.css";

import loadable from "@loadable/component";
import React, { useEffect, useRef, useState } from "react";
import { Link, useHistory, withRouter } from "react-router-dom";
import { fromEvent } from "rxjs";

import { tabBarStream } from "../../epic/tabBar";
import { logoutUser$, userStream } from "../../epic/user";

const PopularTags = loadable(() => import("../PopularTags/PopularTags"));

function NavBar({ userState, removeCookie, cookies, screenWidth }) {
  const history = useHistory();
  const headerBarRef = useRef();
  const headerBarMobileRef = useRef();
  const sideBarRef = useRef();

  const [isShowSearchBar, setIsShowSearchBar] = useState(false);
  const [isShowSideBar, setIsShowSideBar] = useState(false);
  useEffect(() => {
    userStream.updateData({
      isDarkMode: window.localStorage.getItem("isDarkMode") === "true",
    });
  }, []);
  useEffect(() => {
    const subscription = fromEvent(sideBarRef.current, "click").subscribe(
      (e) => {
        if (e.target.className === "App-header__side-bar show") {
          setIsShowSideBar(!isShowSideBar);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [isShowSideBar]);
  useEffect(() => {
    let subscription, subscription1;
    if (screenWidth <= 592 && headerBarRef.current) {
      subscription = fromEvent(headerBarRef.current, "click").subscribe(() => {
        setIsShowSideBar(!isShowSideBar);
        window.document.body.style.overflow = "hidden";
      });
    }
    if (headerBarMobileRef.current) {
      subscription1 = fromEvent(headerBarMobileRef.current, "click").subscribe(
        () => {
          setIsShowSideBar(!isShowSideBar);
          window.document.body.style.overflow = "auto";
        }
      );
    }
    return () => {
      subscription && subscription.unsubscribe();
      subscription1 && subscription1.unsubscribe();
    };
  }, [screenWidth, isShowSideBar]);
  const { isDarkMode } = userStream.currentState();
  useEffect(() => {
    window.localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  document.body.style.backgroundColor = isDarkMode ? "#111519" : "#EEF0F1";
  console.log(screenWidth);
  return (
    <header
      className="App-header"
      style={
        screenWidth <= 592
          ? {
              position: "sticky",
              top: 0,
              left: 0,
              width: "100%",
              backgroundColor: userStream.currentState().isDarkMode
                ? "black"
                : "white",
              zIndex: "5",
              color: !userStream.currentState().isDarkMode ? "black" : "white",
            }
          : {
              backgroundColor: userStream.currentState().isDarkMode
                ? "black"
                : "white",
              color: !userStream.currentState().isDarkMode ? "black" : "white",
            }
      }
    >
      <div
        className="App-header__block-side-bar"
        style={{ display: isShowSideBar ? "block" : "none" }}
        onClick={() => {
          setIsShowSideBar(!isShowSideBar);
          window.document.body.style.overflow = "auto";
        }}
      />
      <aside
        className={`App-header__side-bar-container${isDarkMode ? " dark" : ""}`}
        ref={sideBarRef}
        style={{
          transform: !isShowSideBar ? "translateX(-200px)" : "translateX(0)",
        }}
      >
        <i
          className="fas fa-bars header-bars-mobile fa-2x"
          ref={headerBarMobileRef}
        ></i>
        <Link to="/tags" className="App-header__tags-link">
          <div>Tags</div>
        </Link>
        <Link to="/auth/login" className="App-header__tags-link">
          <div>Login</div>
        </Link>
        <Link to="/auth/register" className="App-header__tags-link">
          <div className="register-link">Create account</div>
        </Link>
        <PopularTags />
      </aside>
      <ul
        className={`App-header__list-link-navbar${isDarkMode ? " dark" : ""}`}
      >
        {screenWidth <= 592 && isShowSearchBar && (
          <div
            className="App-header__search-mobile-post"
            style={{
              backgroundColor: isDarkMode ? "black" : "white",
            }}
          >
            <input
              type="text"
              style={{
                color: isDarkMode ? "white" : "black",
                backgroundColor: isDarkMode ? "black" : "white",
              }}
              placeholder="Search..."
              onKeyDown={(e) => {
                const text = e.target.value.trim();
                if (e.keyCode === 13 && text !== "") {
                  history.push("/posts/search/" + text);
                  e.target.value = "";
                  setIsShowSearchBar(!isShowSearchBar);
                }
              }}
            />
          </div>
        )}
        <div className="App-header__container-wrapper-link">
          <div className="App-header__wrapper-link">
            {screenWidth <= 592 && (
              <i
                className="fas fa-bars header-bars fa-2x"
                ref={headerBarRef}
              ></i>
            )}
            <Link
              className="App-header__link-navbar-item App-header__logo"
              to="/"
            >
              <li>DEV</li>
            </Link>
            {screenWidth > 592 && (
              <input
                className="App-header__input-search"
                style={{
                  color: isDarkMode ? "white" : "black",
                  backgroundColor: isDarkMode ? "black" : "white",
                }}
                type="text"
                placeholder="Search..."
                onKeyDown={(e) => {
                  const text = e.target.value.trim();
                  if (e.keyCode === 13 && text !== "") {
                    history.push("/posts/search/" + text);
                    e.target.value = "";
                  }
                }}
              />
            )}
            {screenWidth <= 592 && (
              <i
                className="fas fa-search search-symbol"
                onClick={() => setIsShowSearchBar(!isShowSearchBar)}
              ></i>
            )}
          </div>
          <div className="App-header__wrapper-link">
            {userStream.currentState().isDarkMode && (
              <i
                className="fas fa-toggle-on fa-2x"
                onClick={() =>
                  userStream.updateData({
                    isDarkMode: !userStream.currentState().isDarkMode,
                  })
                }
              ></i>
            )}
            {!userStream.currentState().isDarkMode && (
              <i
                className="fas fa-toggle-off fa-2x"
                onClick={() =>
                  userStream.updateData({
                    isDarkMode: !userStream.currentState().isDarkMode,
                  })
                }
              ></i>
            )}
            {screenWidth >= 416 && !userState.user && userState.isDoneFetch && (
              <Link
                to="/auth/login"
                className="App-header__link-navbar-item login-link"
              >
                <li>Log in</li>
              </Link>
            )}
            {screenWidth >= 416 && !userState.user && userState.isDoneFetch && (
              <Link
                to="/auth/register"
                className="App-header__link-navbar-item register-link"
              >
                <li>Create Account</li>
              </Link>
            )}
            {userState.user && (
              <div
                className="App-header__link-navbar-item item-account-info"
                style={{
                  color: !userStream.currentState().isDarkMode
                    ? "black"
                    : "white",
                }}
              >
                <span>{userState.user.username}</span>
                <div className="list-link-account">
                  <Link to="/account/edit">
                    <div className="item-link-account">Edit Account</div>
                  </Link>
                  <div
                    className="item-link-account"
                    onClick={() => {
                      removeCookie("idBloggerUser", {
                        path: "/",
                      });
                      logoutUser$(cookies).subscribe(() => {
                        userStream.updateData({
                          user: null,
                        });
                        tabBarStream.updateData({ tabMode: 1 });
                        history.push("/auth/login");
                      });
                    }}
                  >
                    <li>Logout</li>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ul>
    </header>
  );
}

export default withRouter(NavBar);
