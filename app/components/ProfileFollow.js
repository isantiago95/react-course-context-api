import React, { useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import StateContext from '../StateContext';

const ProfileFollow = ({ action }) => {
  const appState = useContext(StateContext);
  const { username } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [follows, setFollows] = React.useState([]);

  React.useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/profile/${username}/${action}`);
        console.log(response);
        setIsLoading(false);
        setFollows(response.data);
      } catch (e) {
        console.log('There was a problem: ', e);
      }
    };
    fetchPosts();
    return () => controller.abort();
  }, [username, action]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className='list-group'>
      {follows.map((follower, index) => (
        <Link
          key={index}
          to={`/profile/${follower.username}`}
          className='list-group-item list-group-item-action'>
          <img className='avatar-tiny' src={follower.avatar} /> {follower.username}
        </Link>
      ))}

      {action === 'followers' && follows.length == 0 && appState.loggedIn && (
        <p>This user does not have any followers yet, be nice and be the first to follow.</p>
      )}

      {action === 'followers' && follows.length > 0 && !appState.loggedIn && (
        <p>This user does not have any followers yet. Sign in to follow this user.</p>
      )}

      {action === 'following' && follows.length == 0 && (
        <p>This user is not following anyone yet</p>
      )}
    </div>
  );
};

export default ProfileFollow;
