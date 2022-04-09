import React from 'react';
import { Link } from 'react-router-dom';
import { parseDate } from '../Main';

const Post = ({ post, onClick, noAuthor }) => {
  return (
    <Link
      onClick={onClick}
      to={`/post/${post._id}`}
      className='list-group-item list-group-item-action'>
      <img className='avatar-tiny' src={post.author.avatar} /> <strong>{post.title}</strong>{' '}
      <span className='text-muted small'>
        {!noAuthor && <span>by {post.author.username}</span>} on {parseDate(post.createdDate)}{' '}
      </span>
    </Link>
  );
};

export default Post;
