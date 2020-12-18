import "./Home.css";

import React from "react";

import CreatePost from "../../components/CreatePost/CreatePost";
import ListPost from "../../components/ListPost/ListPost";
import TabBar from "../../components/TabBar/TabBar";
import { userStream } from "../../epic/user";
import PopularTags from "../../components/PopularTags/PopularTags";
import { Link } from "react-router-dom";
import LatestPosts from "../../components/LatestPosts/LatestPosts";

const Home = () => {
  const { user, quantityUser, isDoneFetch } = userStream.currentState();
  return (
    <div className="home-page__container">
      <aside className="home-page__container-left-section">
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
        <div className="home-page__container-user-quantity">
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
              <span style={{ color: "blue" }}> {user.username} </span>,
              you are a part of our community
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
                <div className="home-page__login-link">Login</div>
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
