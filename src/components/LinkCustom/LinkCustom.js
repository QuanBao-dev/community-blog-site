import React from 'react';
const LinkCustom = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a
      className={`${props.entityKey}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
};

export default LinkCustom;