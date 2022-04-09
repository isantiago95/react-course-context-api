import React from 'react';
import Container from './Container';

const Page = ({ children, title = 'Page', wide = false }) => {
  React.useEffect(() => {
    document.title = `${title} | Complex App`;
    window.scrollTo(0, 0);
  }, [title]);

  return <Container wide={wide}>{children}</Container>;
};

export default Page;
