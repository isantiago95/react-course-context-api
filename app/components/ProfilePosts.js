import React from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { parseDate } from '../Main';
import LoadingDotsIcon from './LoadingDotsIcon';
import Post from './Post';

const ProfilePosts = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [posts, setPosts] = React.useState([]);

  React.useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/profile/${username}/posts`);
        setIsLoading(false);
        setPosts(response.data);
      } catch (e) {
        console.log('There was a problem: ', e);
      }
    };
    fetchPosts();
    return () => controller.abort();
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className='list-group'>
      {posts.map(post => (
        <Post noAuthor={true} post={post} key={post._id} />
      ))}
    </div>
  );
};

export default ProfilePosts;
