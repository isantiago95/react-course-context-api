import React, { useContext } from 'react';
import DispatchContext from '../DispatchContext';
import { useImmer } from 'use-immer';
import axios from 'axios';
import { parseDate } from '../Main';
import { Link } from 'react-router-dom';
import Post from './Post';

const Search = () => {
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0,
  });

  React.useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler);
    return () => document.removeEventListener('keyup', searchKeyPressHandler);
  }, []);

  React.useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = 'loading';
      });
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++;
        });
      }, 700);
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = 'neither';
      });
    }
  }, [state.searchTerm]);

  React.useEffect(() => {
    if (state.requestCount) {
      // send axios request here
      const controller = new AbortController();
      async function fetchResults() {
        try {
          const response = await axios.post('/search', {
            searchTerm: state.searchTerm,
          });
          setState(draft => {
            draft.results = response.data;
            draft.show = 'results';
          });
        } catch (e) {
          console.log('There was a problem: ', e);
        }
      }
      fetchResults();
      return () => controller.abort();
    }
  }, [state.requestCount]);

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({
        type: 'closeSearch',
      });
    }
  }

  function handleInput(e) {
    const value = e.target.value;
    setState(draft => {
      draft.searchTerm = value;
    });
  }

  return (
    <>
      <div className='search-overlay-top shadow-sm'>
        <div className='container container--narrow'>
          <label htmlFor='live-search-field' className='search-overlay-icon'>
            <i className='fas fa-search'></i>
          </label>
          <input
            autoFocus
            type='text'
            autoComplete='off'
            id='live-search-field'
            className='live-search-field'
            placeholder='What are you interested in?'
            onChange={handleInput}
          />
          <span
            onClick={() =>
              appDispatch({
                type: 'closeSearch',
              })
            }
            className='close-live-search'>
            <i className='fas fa-times-circle'></i>
          </span>
        </div>
      </div>

      <div className='search-overlay-bottom'>
        <div className='container container--narrow py-3'>
          <div
            className={
              'circle-loader ' + (state.show == 'loading' ? 'circle-loader--visible' : '')
            }></div>
          <div
            className={
              'live-search-results ' +
              (state.show == 'results' ? 'live-search-results--visible' : '')
            }>
            {Boolean(state.results.length) && (
              <div className='list-group shadow-sm'>
                <div className='list-group-item active'>
                  <strong>Search Results</strong> ({state.results.length}{' '}
                  {state.results.length > 1 ? 'items' : 'item'} found)
                </div>
                {state.results.map(post => (
                  <Post
                    post={post}
                    key={post._id}
                    onClick={() => appDispatch({ type: 'closeSearch' })}
                  />
                ))}
              </div>
            )}
            {Boolean(!state.results.length) && (
              <p className='alert alert-danger text-center shadow-sm'>
                Sorry, we couldn't find any results for that search.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
