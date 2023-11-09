import React, { useState } from 'react';
export const PageBlock = (props) => {
  console.log('props', props);
  const { value, id } = props;
  console.log('value', value);

  return (
    <div>
      {id}
      {value.title}
    </div>
  );
};
