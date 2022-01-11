import React, { useState } from 'react';

const NewTweetForm = ({ tweetService, onError }) => {
  const [tweet, setTweet] = useState('');
  const [tag, setTag] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    tweetService
      .postTweet(tweet, tag)
      .then((created) => {
        setTweet('');
        setTag('');
      })
      .catch(onError);
  };

  const onChange = (event) => {
    setTweet(event.target.value);
  };

  const onChangetag = (event) => {
    setTag(event.target.value);
  };

  return (
    <form className='tweet-form' onSubmit={onSubmit}>
      <input
        type='text'
        placeholder='Edit your tweet'
        value={tweet}
        required
        autoFocus
        onChange={onChange}
        className='form-input tweet-input'
      />
      <input
        type='text'
        placeholder='Tag'
        value={tag}
        autoFocus
        onChange={onChangetag}
        className='form-input tag-input'
      />
      <button type='submit' className='form-btn'>
        Post
      </button>
    </form>
  );
};

export default NewTweetForm;
