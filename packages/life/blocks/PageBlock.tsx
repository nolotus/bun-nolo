import React, { useState } from 'react';
export const PageBlock = (props) => {
  console.log('props', props);
  const { value } = props;
  console.log('value', value);

  return <div>{value.title}</div>;
};
