import "./Home.css";

import loadable from "@loadable/component";
import React from "react";
import { Link } from "react-router-dom";

import { userStream } from "../../epic/user";

const TabBar = loadable(() => import("../../components/TabBar/TabBar"));
const CreatePost = loadable(() =>
  import("../../components/CreatePost/CreatePost")
);
const ListPost = loadable(() => import("../../components/ListPost/ListPost"));
const PopularTags = loadable(() =>
  import("../../components/PopularTags/PopularTags")
);
const LatestPosts = loadable(() =>
  import("../../components/LatestPosts/LatestPosts")
);

const Home = () => {
  const {
    user,
    quantityUser,
    isDoneFetch,
    isDarkMode,
  } = userStream.currentState();

  return (
    <div className="home-page__container">
      <aside
        className={`home-page__container-left-section${
          isDarkMode ? " dark" : ""
        }`}
      >
        <ul>
          <Link to="/tags" className="home-page__tags-link">
            <li>
              <div>Tags</div>
            </li>
          </Link>
        </ul>
        <PopularTags />
      </aside>
      <main className="home-page__container-main-section">
        {user && <CreatePost />}
        {user && <TabBar />}
        <ListPost />
      </main>
      <aside className="home-page__container-right-section">
        <div
          className={`home-page__container-user-quantity${
            isDarkMode ? " dark" : ""
          }`}
        >
          <img
            src="https://res.cloudinary.com/practicaldev/image/fetch/s--g3JdSGe6--/c_limit,f_auto,fl_progressive,q_80,w_190/https://practicaldev-herokuapp-com.freetls.fastly.net/assets/rainbowdev.svg"
            alt="Not_Found"
          />
          {!user && (
            <h1>
              <span style={{ color: "blue" }}>DEV </span>
              is a community of {quantityUser < 100
                ? "several"
                : quantityUser}{" "}
              amazing developers
            </h1>
          )}
          {user && (
            <h1>
              Hello
              <span style={{ color: "blue" }}> {user.username} </span>, you are
              a part of our community
            </h1>
          )}
          <p>
            We're a place where coders share, stay up-to-date and grow their
            careers.
          </p>
          {!user && isDoneFetch && (
            <div className="home-page__container-list-link">
              <Link to="/auth/register">
                <div className="home-page__register-link">
                  Create new account
                </div>
              </Link>
              <Link to="/auth/login">
                <div
                  className={`home-page__login-link${
                    isDarkMode ? " dark" : ""
                  }`}
                >
                  Login
                </div>
              </Link>
            </div>
          )}
        </div>
        <LatestPosts />
      </aside>
    </div>
  );
};
export default Home;
