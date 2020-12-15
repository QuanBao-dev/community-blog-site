import './HeaderEditForm.css';

import React from 'react';

import Input from '../Input/Input';

const HeaderEditForm = ({
  boardEditRef,
  titleRef,
  introRef,
  tagRef,
  title,
  excerpt,
  dataSend,
  setDataSend,
  buttonSubmitRef,
}) => {
  return (
    <div className="edit-board-container" ref={boardEditRef}>
      <Input label="Title" input={titleRef} defaultValue={title} />
      <Input label="Introduction" input={introRef} defaultValue={excerpt} />
      <Input
        label="Tag"
        input={tagRef}
        isSuggestion={true}
        dataSend={dataSend}
        setDataSend={setDataSend}
      />
      <button
        className="edit-board-container__button-submit"
        ref={buttonSubmitRef}
      >
        Update
      </button>
    </div>
  );
};

export default HeaderEditForm;
