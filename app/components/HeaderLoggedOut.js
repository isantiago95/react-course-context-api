import React, { useContext } from 'react';
import axios from 'axios';
import DispatchContext from '../DispatchContext';

const HeaderLoggedOut = () => {
  const appDispatch = useContext(DispatchContext);
  const [username, setusername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', {
        username,
        password,
      });
      if (response.data) {
        appDispatch({
          type: 'login',
          data: response.data,
        });
        appDispatch({
          type: 'flashMessage',
          value: 'You have successfully logged in',
        });
      } else {
        appDispatch({
          type: 'flashMessage',
          value: 'Invalid username / password',
        });
      }
    } catch (error) {
      console.log(error.response.data[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='mb-0 pt-2 pt-md-0'>
      <div className='row align-items-center'>
        <div className='col-md mr-0 pr-md-0 mb-3 mb-md-0'>
          <input
            name='username'
            className='form-control form-control-sm input-dark'
            type='text'
            placeholder='username'
            autoComplete='off'
            onChange={e => setusername(e.target.value)}
          />
        </div>
        <div className='col-md mr-0 pr-md-0 mb-3 mb-md-0'>
          <input
            name='password'
            className='form-control form-control-sm input-dark'
            type='password'
            placeholder='Password'
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className='col-md-auto'>
          <button className='btn btn-success btn-sm'>Sign In</button>
        </div>
      </div>
    </form>
  );
};

export default HeaderLoggedOut;
