import React, { Suspense } from 'react';
import ReactDom from 'react-dom';
import { useImmerReducer } from 'use-immer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';

axios.defaults.baseURL = process.env.BACKENDURL || 'https://backend-react-course.herokuapp.com';

import DispatchContext from './DispatchContext';
import StateContext from './StateContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomeGuest from './components/HomeGuest';
import Home from './components/Home';
import About from './components/About';
import Terms from './components/Terms';
const CreatePost = React.lazy(() => import('./components/CreatePost'));
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'));
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
const Search = React.lazy(() => import('./components/Search'));
const Chat = React.lazy(() => import('./components/Chat'));
import LoadingDotsIcon from './components/LoadingDotsIcon';

const initialState = {
  loggedIn: Boolean(localStorage.getItem('complexAppToken')),
  flashMessages: [],
  user: {
    token: localStorage.getItem('complexAppToken'),
    username: localStorage.getItem('complexAppUsername'),
    avatar: localStorage.getItem('complexAppAvatar'),
  },
  isSearchOpen: false,
  isChatOpen: false,
  unreadChatCount: 0,
};
function ourReducer(draft, action) {
  switch (action.type) {
    case 'login': {
      draft.loggedIn = true;
      draft.user = action.data;
      return;
    }
    case 'logout': {
      draft.loggedIn = false;
      return;
    }
    case 'flashMessage': {
      draft.flashMessages.push(action.value);
      return;
    }
    case 'openSearch': {
      draft.isSearchOpen = true;
      return;
    }
    case 'closeSearch': {
      draft.isSearchOpen = false;
      return;
    }
    case 'toggleChat': {
      draft.isChatOpen = !draft.isChatOpen;
      return;
    }
    case 'closeChat': {
      draft.isChatOpen = false;
      return;
    }
    case 'incrementUnreadChatCount': {
      draft.unreadChatCount++;
      return;
    }
    case 'clearUnreadChatCount': {
      draft.unreadChatCount = 0;
      return;
    }
  }
}

function Main() {
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  React.useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexAppToken', state.user.token);
      localStorage.setItem('complexAppUsername', state.user.username);
      localStorage.setItem('complexAppAvatar', state.user.avatar);
    } else {
      localStorage.removeItem('complexAppToken');
      localStorage.removeItem('complexAppUsername');
      localStorage.removeItem('complexAppAvatar');
    }
  }, [state.loggedIn]);

  // check if token has expired or not on first render
  React.useEffect(() => {
    if (state.loggedIn) {
      // send axios request here
      const controller = new AbortController();
      async function fetchResults() {
        try {
          const response = await axios.post('/checkToken', {
            token: state.user.token,
          });
          if (!response.data) {
            dispatch({
              type: 'logout',
            });
            dispatch({
              type: 'flashMessage',
              value: 'Your session has expired, please log in again.',
            });
          }
        } catch (e) {
          console.log('There was a problem: ', e);
        }
      }
      fetchResults();
      return () => controller.abort();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path='/profile/:username/*' element={<Profile />} />
              <Route path='/' element={state.loggedIn ? <Home /> : <HomeGuest />} />
              <Route path='/post/:id' element={<ViewSinglePost />} />
              <Route path='/post/:id/edit' element={<EditPost />} />
              <Route path='/create-post' element={<CreatePost />} />
              <Route path='/about-us' element={<About />} />
              <Route path='/terms' element={<Terms />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames='search-overlay'
            unmountOnExit>
            <div className='search-overlay'>
              <Suspense fallback=''>
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Footer />
          <Suspense fallback=''>{state.loggedIn && <Chat />}</Suspense>
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export const parseDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

ReactDom.render(<Main />, document.querySelector('#app'));

if (module.hot) module.hot.accept();
