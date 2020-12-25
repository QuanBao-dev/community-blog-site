import "./Input.css";
import React, { useEffect, useState } from "react";
import { fromEvent, of } from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  pluck,
  switchMap,
} from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { userStream } from "../../epic/user";

const Input = ({
  label,
  input,
  type,
  error = null,
  defaultValue = "",
  isSuggestion = false,
  dataSend,
  setDataSend,
}) => {
  const [dataSuggestion, setDataSuggestion] = useState([]);
  const [indexActiveSuggest, setIndexActiveSuggest] = useState(null);
  useEffect(() => {
    let subscription;
    if (isSuggestion)
      subscription = fetchTagsSearch$(input.current).subscribe((v) => {
        if (!v.error) {
          const data = v.filter(({ tagName }) => !dataSend.includes(tagName));
          setDataSuggestion(data);
          setIndexActiveSuggest(null);
        } else {
          setDataSuggestion([]);
          setIndexActiveSuggest(null);
        }
      });
    return () => {
      subscription && subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSend]);
  const { isDarkMode } = userStream.currentState();
  return (
    <div style={{ width: "100%", color: isDarkMode ? "white" : "black" }}>
      {isSuggestion && (
        <div className="tag-name-list">
          {dataSend.map((tag, index) => (
            <span key={index} className="tag-name-item">
              <span
                className="delete-tag-symbol"
                onClick={() => {
                  const filter = dataSend
                    .filter((a, key) => key !== index)
                    .map((a) => a.toLocaleLowerCase());
                  setDataSend(filter);
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </span>
              <span className="tag-name-text"> #{tag} </span>
            </span>
          ))}
        </div>
      )}
      <div className={`form-custom${isDarkMode ? " dark" : ""}`}>
        <input
          style={{ color: !isDarkMode ? "black" : "white" }}
          defaultValue={defaultValue}
          ref={input}
          type={type || "text"}
          required
          onKeyDown={(e) => {
            if (
              isSuggestion &&
              e.keyCode === 13 &&
              indexActiveSuggest === null
            ) {
              if (e.target.value.trim() === "") {
                return;
              }
              if (!dataSend.includes(e.target.value)) {
                setDataSend([...dataSend, e.target.value.toLocaleLowerCase()]);
              }
              setDataSuggestion([]);
              e.target.value = "";
            }
            if (
              isSuggestion &&
              e.keyCode === 13 &&
              indexActiveSuggest !== null &&
              dataSuggestion[indexActiveSuggest]
            ) {
              setDataSend([
                ...dataSend,
                dataSuggestion[indexActiveSuggest].tagName.toLocaleLowerCase(),
              ]);
              setDataSuggestion([]);
              e.target.value = "";
            }
            if (e.keyCode === 38 || e.keyCode === 40) {
              e.preventDefault();
              if (dataSuggestion.length > indexActiveSuggest)
                if (e.keyCode === 40) {
                  if (indexActiveSuggest === null) {
                    setIndexActiveSuggest(0);
                  } else if (indexActiveSuggest === dataSuggestion.length - 1) {
                    setIndexActiveSuggest(0);
                  } else if (indexActiveSuggest < dataSuggestion.length) {
                    setIndexActiveSuggest(indexActiveSuggest + 1);
                  }
                } else {
                  if (indexActiveSuggest === 0) {
                    setIndexActiveSuggest(null);
                  } else if (indexActiveSuggest > 0) {
                    setIndexActiveSuggest(indexActiveSuggest - 1);
                  }
                }
            }
          }}
        />
        <label className="label-name">{label}</label>
      </div>
      {error && <div className="error-message">Error: {error}</div>}
      {isSuggestion && (
        <div
          className="suggestion-hint-list"
          style={{ display: dataSuggestion.length === 0 ? "none" : "block" }}
        >
          {dataSuggestion.map(({ tagName }, index) => (
            <div
              className={`suggestion-hint-item${
                indexActiveSuggest === index
                  ? " suggestion-hint-item-active"
                  : ""
              }`}
              key={index}
              onClick={(e) => {
                const text = e.target.innerText.toLocaleLowerCase();
                const data = [...dataSend, text];
                setDataSend(data);
                e.target.innerText = "";
                input.current.value = "";
                setDataSuggestion([]);
              }}
            >
              {tagName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const fetchTagsSearch$ = (tagInput) => {
  return fromEvent(tagInput, "input").pipe(
    debounceTime(100),
    map((v) => v.target.value),
    switchMap((key) =>
      ajax({ url: "/api/tags/search/" + key }).pipe(
        pluck("response", "message"),
        catchError((error) =>
          of(error).pipe(
            pluck("response", "error"),
            map((error) => ({ error }))
          )
        )
      )
    )
  );
};

export default Input;
