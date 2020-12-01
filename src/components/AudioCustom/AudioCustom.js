import React from 'react';
const AudioCustom = (props) => {
  const { url, className } = props.contentState
    .getEntity(props.entityKey)
    .getData();
  return (
    <div className={className}>
      <audio src={url} controls></audio>
    </div>
  );
};

export default AudioCustom;