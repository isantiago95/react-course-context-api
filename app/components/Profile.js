import React, { useContext } from 'react';
import Page from './Page';
import { useParams, NavLink, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import StateContext from '../StateContext';
import ProfilePosts from './ProfilePosts';
import ProfileFollow from './ProfileFollow';
import { useImmer } from 'use-immer';

const Profile = () => {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isfollow: false,
      counts: {
        postCount: '',
        followerCount: '',
        followingCount: '',
      },
    },
  });

  React.useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      try {
        const response = await axios.post(`/profile/${username}`, {
          token: appState.user.token,
        });
        setState(draft => {
          draft.profileData = response.data;
        });
      } catch (e) {
        console.error('there was a problem: ', e);
      }
    }
    fetchData();
    return () => controller.abort();
  }, [username]);

  React.useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true;
      });
      const controller = new AbortController();
      async function fetchData() {
        try {
          const { status } = await axios.post(`/addFollow/${state.profileData.profileUsername}`, {
            token: appState.user.token,
          });
          if (status === 200)
            setState(draft => {
              draft.profileData.isFollowing = true;
              draft.profileData.counts.followerCount++;
              draft.followActionLoading = false;
            });
        } catch (e) {
          console.error('there was a problem: ', e);
        }
      }
      fetchData();
      return () => controller.abort();
    }
  }, [state.startFollowingRequestCount]);

  React.useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true;
      });
      const controller = new AbortController();
      async function fetchData() {
        try {
          const response = await axios.post(`/removeFollow/${state.profileData.profileUsername}`, {
            token: appState.user.token,
          });
          setState(draft => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (e) {
          console.error('there was a problem: ', e);
        }
      }
      fetchData();
      return () => controller.abort();
    }
  }, [state.stopFollowingRequestCount]);

  const startFollowing = () =>
    setState(draft => {
      draft.startFollowingRequestCount++;
    });

  const stopFollowing = () =>
    setState(draft => {
      draft.stopFollowingRequestCount++;
    });

  return (
    <Page title='Profile Screen'>
      <h2>
        <img className='avatar-small' src={state.profileData.profileAvatar} />{' '}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className='btn btn-primary btn-sm ml-2'>
              Follow <i className='fas fa-user-plus'></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className='btn btn-danger btn-sm ml-2'>
              Stop Following <i className='fas fa-user-times'></i>
            </button>
          )}
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <NavLink to='' end className='nav-item nav-link'>
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to='followers' className='nav-item nav-link'>
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to='following' className='nav-item nav-link'>
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Routes>
        <Route path='' element={<ProfilePosts />} />
        <Route path='followers' element={<ProfileFollow action='followers' />} />
        <Route path='following' element={<ProfileFollow action='following' />} />
      </Routes>
    </Page>
  );
};

export default Profile;
