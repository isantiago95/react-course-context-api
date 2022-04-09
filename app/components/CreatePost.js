import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from './Page';
import axios from 'axios';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

const CreatePost = () => {
  const [title, setTitle] = React.useState();
  const [body, setBody] = React.useState();
  const navigate = useNavigate();
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('/create-post', {
        title,
        body,
        token: appState.user.token,
      });
      // redirect to new post url
      appDispatch({ type: 'flashMessage', value: 'Great, post was created!!' });
      navigate(`/post/${response.data}`);
      console.log('new post was created');
    } catch (error) {
      console.log('there was an error');
    }
  };

  return (
    <Page title='Create Post'>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            autoFocus
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
            onChange={e => setBody(e.target.value)}></textarea>
        </div>

        <button className='btn btn-primary'>Save New Post</button>
      </form>
    </Page>
  );
};

export default CreatePost;
