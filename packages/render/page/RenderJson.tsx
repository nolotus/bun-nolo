import React from 'react';
export const RenderJson = ({ data }) => {
  return (
    <>
      <pre>{JSON.stringify(data, null, 2)}</pre>;
    </>
  );
};
