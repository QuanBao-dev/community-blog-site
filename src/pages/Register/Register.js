import "./Register.css";

import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import Input from "../../components/Input/Input";
import { submitForm$, userStream } from "../../epic/user";

const Register = () => {
  const [errorUsername, setErrorUsername] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);
  const [errorEmail, setErrorEmail] = useState(null);
  const history = useHistory();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const emailRef = useRef();
  const { user, isDoneFetch, quantityUser } = userStream.currentState();
  useEffect(() => {
    if (user) {
      history.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let subscription;
    if (isDoneFetch && !user) {
      const buttonSubmit = document.querySelector(".button-register-submit");
      subscription = submitForm$(
        buttonSubmit,
        {
          username: usernameRef.current,
          email: emailRef.current,
          password: passwordRef.current,
        },
        "/api/users/register"
      ).subscribe((result) => {
        handleResult(
          result,
          history,
          setErrorEmail,
          setErrorUsername,
          setErrorPassword
        );
      });
    }
    return () => {
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    !user &&
    isDoneFetch && (
      <div className="register-page">
        <div className="register-page__container-register">
          <h1>Welcome to DEV</h1>
          <div className="text-welcome">
            DEV is a community of{" "}
            {quantityUser < 100 ? "several" : quantityUser} amazing developers
          </div>
          <Input label="Email" error={errorEmail} input={emailRef} />
          <Input label="Username" error={errorUsername} input={usernameRef} />
          <Input
            type="password"
            label="Password"
            error={errorPassword}
            input={passwordRef}
          />
          <button className="button-register-submit">Done</button>
        </div>
      </div>
    )
  );
};
export default Register;
function handleResult(
  result,
  history,
  setErrorEmail,
  setErrorUsername,
  setErrorPassword
) {
  if (!result.error) {
    alert("Success, please sign in");
    history.push("/auth/login");
  } else {
    const errorMessage = result.error.response.error.toLocaleLowerCase();
    if (errorMessage.includes("email")) setErrorEmail(errorMessage);
    else setErrorEmail(null);

    if (errorMessage.includes("username")) setErrorUsername(errorMessage);
    else setErrorUsername(null);

    if (errorMessage.includes("password")) setErrorPassword(errorMessage);
    else setErrorPassword(null);
  }
}
