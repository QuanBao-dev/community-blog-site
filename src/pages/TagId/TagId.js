import './TagId.css';

import React, { useEffect, useState } from 'react';
import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, pluck } from 'rxjs/operators';

import ListPost from '../../components/ListPost/ListPost';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const TagId = ({ match }) => {
  const { tagId } = match.params;
  const [tag, setTag] = useState();
  const history = useHistory();
  useEffect(() => {
    const subscription = ajax("/api/tags/" + tagId)
      .pipe(
        pluck("response", "message"),
        catchError((error) => of({error}))
      )
      .subscribe((v) => {
        if (!v.error) {
          setTag(v);
        } else {
          history.push("/");
          alert("Invalid Tag");
        }
      });
    return () => {
      setTag(null);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);
  // console.log(tag);
  return (
    <div>
      {tag && (
        <div className="tag-header-container">
          <h1>
            <span style={{ color: "grey" }}>#</span>
            {tag.tagName}
          </h1>
          <p>
            {tag.quantity} published post{tag.quantity > 1 ? "s" : ""}
          </p>
        </div>
      )}
      <ListPost tagId={tagId} />
    </div>
  );
};

export default TagId;
