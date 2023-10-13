import React from 'react';

const List = ({children, ordered}) => {
  const listStyle = ordered ? 'list-decimal' : 'list-disc';
  return <ul className={`${listStyle} list-inside pl-5`}>{children}</ul>;
};

export default List;
