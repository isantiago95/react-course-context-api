import React, { useContext } from 'react';
import Page from './Page';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { parseDate } from '../Main';
import LoadingDotsIcon from './LoadingDotsIcon';
import ReactMarkDown from 'react-markdown';
import ReactToolTip from 'react-tooltip';
import NotFound from './NotFound';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

const ViewSinglePost = () => {
  const navigate = useNavigate();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [post, setPost] = React.useState();

  React.useEffect(() => {
    const controller = new AbortController();
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${id}`);
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.error('There was a problem: ', e);
      }
    };
    fetchPost();
    return () => controller.abort();
  }, [id]);

  if (!isLoading && !post) return <NotFound />;

  if (isLoading)
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    );

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username === post.author.username;
    }
    return false;
  }

  const deleteHandler = async () => {
    const areYouSure = window.confirm('Do you really want to delete this post?');
    if (areYouSure) {
      try {
        const response = await axios.delete(`/post/${id}`, {
          data: {
            token: appState.user.token,
          },
        });
        if (response.data == 'Success') {
          // 1. display flash message
          appDispatch({
            type: 'flashMessage',
            value: 'Post was successfully deleted.',
          });
          // 2. redirect to the current user's profile
          navigate(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log('there was a problem: ', e);
      }
    }
  };

  return (
    <Page title={post.title}>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className='pt-2'>
            <Link
              to={`/post/${post._id}/edit`}
              data-tip='Edit'
              data-for='edit'
              className='text-primary mr-2'>
              <i className='fas fa-edit'></i>
            </Link>
            <ReactToolTip id='edit' className='custom-tooltip' />{' '}
            <a
              onClick={deleteHandler}
              data-tip='Delete'
              data-for='delete'
              className='delete-post-button text-danger'>
              <i className='fas fa-trash'></i>
            </a>
            <ReactToolTip id='delete' className='custom-tooltip' />
          </span>
        )}
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}`}>
          <img className='avatar-tiny' src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on{' '}
        {parseDate(post.createdDate)}
      </p>

      <div className='body-content'>
        <ReactMarkDown
          children={post.body}
          allowedElements={[
            'p',
            'br',
            'strong',
            'em',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'ul',
            'ol',
            'li',
          ]}
        />
      </div>
    </Page>
  );
};

export default ViewSinglePost;
