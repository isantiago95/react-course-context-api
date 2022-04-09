import React, { useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import Page from './Page';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingDotsIcon from './LoadingDotsIcon';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import NotFound from './NotFound';

const EditPost = () => {
  const navigate = useNavigate();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete': {
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      }
      case 'titleChange': {
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        return;
      }
      case 'bodyChange': {
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        return;
      }
      case 'submitRequest': {
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      }
      case 'saveRequestStarted': {
        draft.isSaving = true;
        return;
      }
      case 'saveRequestFinished': {
        draft.isSaving = false;
        return;
      }
      case 'titleRules': {
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = 'You must provide a title.';
        }
        return;
      }
      case 'bodyRules': {
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = 'You must provide body content.';
        }
        return;
      }
      case 'notFound': {
        draft.notFound = true;
        return;
      }
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);
  const _submitHandler = e => {
    e.preventDefault();
    dispatch({
      type: 'titleRules',
      value: state.title.value,
    });
    dispatch({
      type: 'bodyRules',
      value: state.body.value,
    });
    dispatch({
      type: 'submitRequest',
    });
  };

  React.useEffect(() => {
    const controller = new AbortController();
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${state.id}`);
        if (response.data) {
          dispatch({
            type: 'fetchComplete',
            value: response.data,
          });
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: 'flashMessage',
              value: "You don't have permission to edit that post.",
            });
            navigate('/');
          }
        } else {
          console.log('entre al not found...');
          dispatch({
            type: 'notFound',
          });
        }
      } catch (e) {
        console.error('There was a problem: ', e);
      }
    };
    fetchPost();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    if (state.sendCount) {
      dispatch({
        type: 'saveRequestStarted',
      });
      const controller = new AbortController();
      const fetchPost = async () => {
        try {
          const response = await axios.post(`/post/${state.id}/edit`, {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token,
          });
          dispatch({
            type: 'fetchComplete',
            value: response.data,
          });
          appDispatch({
            type: 'flashMessage',
            value: 'Post was successfully updated',
          });
        } catch (e) {
          console.error('There was a problem: ', e);
        }
      };
      fetchPost();
      return () => controller.abort();
    }
  }, [state.sendCount]);

  if (state.notFound) return <NotFound />;

  if (state.isFetching)
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    );

  return (
    <Page title='Edit Post'>
      <Link className='small font-weight-bold' to={`/post/${state.id}`}>
        &laquo; Back to post view
      </Link>
      <form className='mt-3' onSubmit={_submitHandler}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          {state.title.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.title.message}
            </div>
          )}
          <input
            autoFocus
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
            value={state.title.value}
            onChange={e =>
              dispatch({
                type: 'titleChange',
                value: e.target.value,
              })
            }
            onBlur={e =>
              dispatch({
                type: 'titleRules',
                value: e.target.value,
              })
            }
          />
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          {state.body.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>{state.body.message}</div>
          )}
          <textarea
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
            value={state.body.value}
            onChange={e =>
              dispatch({
                type: 'bodyChange',
                value: e.target.value,
              })
            }
            onBlur={e =>
              dispatch({
                type: 'bodyRules',
                value: e.target.value,
              })
            }
          />
        </div>

        <button className='btn btn-primary' disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  );
};

export default EditPost;
