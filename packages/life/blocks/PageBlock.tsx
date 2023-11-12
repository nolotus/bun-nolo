import React from 'react';
import { Link } from 'react-router-dom';

export const PageBlock = (props) => {
  console.log('props', props);
  const { value, id } = props;

  return (
    <Link to={`/${id}`} className="p-2 w-full sm:w-1/2 lg:w-1/3">
      {id}
      {value.title}
    </Link>
  );
};
