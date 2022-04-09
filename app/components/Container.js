import React from 'react';

const Container = ({ wide, children }) => {
  return <div className={'container py-md-5 ' + (wide ? '' : 'container--narrow')}>{children}</div>;
};

export default Container;
