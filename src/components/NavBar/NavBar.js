import "./NavBar.css";

import React, { useEffect, useRef, useState } from "react";
import { Link, useHistory, withRouter } from "react-router-dom";

import { tabBarStream } from "../../epic/tabBar";
import { logoutUser$, userStream } from "../../epic/user";
import { fromEvent } from "rxjs";
import PopularTags from "../PopularTags/PopularTags";

function NavBar({ userState, removeCookie, cookies, screenWidth }) {
  const history = useHistory();
  const headerBarRef = useRef();
  const headerBarMobileRef = useRef();
  const sideBarRef = useRef();

  const [isShowSearchBar, setIsShowSearchBar] = useState(false);
  const [isShowSideBar, setIsShowSideBar] = useState(false);
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
              backgroundColor: "white",
              zIndex: "5",
            }
          : {}
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
        className="App-header__side-bar-container"
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
        <PopularTags />
      </aside>
      <ul className="App-header__list-link-navbar">
        {screenWidth <= 592 && isShowSearchBar && (
          <div className="App-header__search-mobile-post">
            <input
              type="text"
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
            {!userState.user && (
              <Link
                to="/auth/login"
                className="App-header__link-navbar-item login-link"
              >
                <li>Log in</li>
              </Link>
            )}
            {!userState.user && (
              <Link
                to="/auth/register"
                className="App-header__link-navbar-item register-link"
              >
                <li>Create Account</li>
              </Link>
            )}
            {userState.user && (
              <div className="App-header__link-navbar-item item-account-info">
                <span>Account</span>
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
                  <div className="item-link-account">
                    {userState.user.username}
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
