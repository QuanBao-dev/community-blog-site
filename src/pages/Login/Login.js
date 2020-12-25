import "./Login.css";

import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";

import Input from "../../components/Input/Input";
import {
  fetchUser$,
  submitForm$,
  submitFormWithEnter$,
  userStream,
} from "../../epic/user";

const Login = () => {
  const [errorEmail, setErrorEmail] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);
  const emailRef = useRef();
  const history = useHistory();
  const passwordRef = useRef();
  const [, setCookie] = useCookies(["idBloggerUser"]);
  const { user, isDoneFetch, quantityUser } = userStream.currentState();
  useEffect(() => {
    if (user) {
      history.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  useEffect(() => {
    let subscription;
    let subscription2;
    if (isDoneFetch && !user) {
      const buttonSubmit = document.querySelector(".button-login-submit");
      subscription = submitForm$(
        buttonSubmit,
        { email: emailRef.current, password: passwordRef.current },
        "/api/users/login"
      ).subscribe((result) => {
        handleResult(
          result,
          setCookie,
          setErrorEmail,
          setErrorPassword,
          history
        );
      });
      subscription2 = submitFormWithEnter$(
        [emailRef.current, passwordRef.current],
        { email: emailRef.current, password: passwordRef.current },
        "/api/users/login"
      ).subscribe((result) => {
        handleResult(
          result,
          setCookie,
          setErrorEmail,
          setErrorPassword,
          history
        );
      });
    }
    return () => {
      subscription2 && subscription2.unsubscribe();
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDoneFetch]);
  const { isDarkMode } = userStream.currentState();
  return (
    !user &&
    isDoneFetch && (
      <div className="login-page">
        <div
          className={`login-page__container-login${isDarkMode ? " dark" : ""}`}
        >
          <h1>Welcome to DEV</h1>
          <div className="text-welcome">
            DEV is a community of{" "}
            {quantityUser < 100 ? "several" : quantityUser} amazing developers
          </div>
          <Input label="Email" error={errorEmail} input={emailRef} />
          <Input
            type="password"
            label="Password"
            error={errorPassword}
            input={passwordRef}
          />
          <button className="button-login-submit">Done</button>
        </div>
      </div>
    )
  );
};

export default Login;
function handleResult(
  result,
  setCookie,
  setErrorEmail,
  setErrorPassword,
  history
) {
  if (!result.error) {
    setCookie("idBloggerUser", result, {
      expires: new Date(Date.now() + 43200000),
      path: "/",
    });
    fetchUser$({ idBloggerUser: result }).subscribe((user) => {
      if (!user.error) {
        userStream.updateData({ user });
        history.replace("/");
      } else {
        userStream.updateData({ user: null });
      }
      userStream.updateData({ isDoneFetch: true });
    });
  } else {
    const errorMessage = result.error.toLocaleLowerCase();
    if (errorMessage.includes("email")) setErrorEmail(errorMessage);
    else setErrorEmail(null);

    if (errorMessage.includes("password")) setErrorPassword(errorMessage);
    else setErrorPassword(null);
  }
}
