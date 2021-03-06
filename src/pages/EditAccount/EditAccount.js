import "./EditAccount.css";

import React, { useEffect, useRef, useState } from "react";
import Input from "../../components/Input/Input";
import { fetchUser$, submitForm$, userStream } from "../../epic/user";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";

const EditAccount = () => {
  const [errorCurrentPassword, setErrorCurrentPassword] = useState();
  const [errorUsername, setErrorUsername] = useState();
  const [errorPassword, setErrorPassword] = useState();
  const [errorEmail, setErrorEmail] = useState();
  const [cookies, setCookie] = useCookies(["idBloggerUser"]);
  const { user, isDarkMode } = userStream.currentState();

  const history = useHistory();
  const currentPasswordRef = useRef();
  const passwordRef = useRef();
  const emailRef = useRef();
  const usernameRef = useRef();
  const buttonRef = useRef();
  useEffect(() => {
    if (user) {
      emailRef.current.value = user.email;
      usernameRef.current.value = user.username;
    }
  }, [user]);
  useEffect(() => {
    const subscription = submitForm$(
      buttonRef.current,
      {
        newUsername: usernameRef.current,
        currentPassword: currentPasswordRef.current,
        newPassword: passwordRef.current,
        newEmail: emailRef.current,
      },
      "/api/users/account/edit",
      "PUT",
      cookies
    ).subscribe((v) => {
      if (!v.error) {
        setCookie("isBloggerUser", v, {
          path: "/",
        });
        fetchUser$({ idBloggerUser: v }).subscribe((user) => {
          if (!user.error) {
            userStream.updateData({ user });
            history.replace("/");
          } else {
            userStream.updateData({ user: null });
          }
          userStream.updateData({ isDoneFetch: true });
        });
      } else {
        const message = v.error;
        setErrorEmail(null);
        setErrorUsername(null);
        setErrorPassword(null);
        setErrorCurrentPassword(null);

        if (message.toLocaleLowerCase() === "invalid password") {
          setErrorCurrentPassword(message);
        } else if (message.toLocaleLowerCase().includes("currentpassword")) {
          setErrorCurrentPassword(message);
        } else if (message.toLocaleLowerCase().includes("password")) {
          setErrorPassword(message);
        } else if (message.toLocaleLowerCase().includes("username")) {
          setErrorUsername(message);
        } else if (message.toLocaleLowerCase().includes("email")) {
          setErrorEmail(message);
        } else if (message.toLocaleLowerCase().includes("at least")) {
          alert(message);
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies]);
  return (
    <div className={`account-edit-form${isDarkMode ? " dark" : ""}`}>
      <h1>Edit Account</h1>
      <Input
        label={"Current Password"}
        error={errorCurrentPassword}
        input={currentPasswordRef}
        type="password"
      />
      <Input label={"New Username"} error={errorUsername} input={usernameRef} />
      <Input
        label={"New Password"}
        error={errorPassword}
        input={passwordRef}
        type="password"
      />
      <Input label={"New Email"} error={errorEmail} input={emailRef} />
      <button ref={buttonRef}>Submit</button>
    </div>
  );
};
export default EditAccount;
