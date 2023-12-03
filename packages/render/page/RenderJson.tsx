import React from 'react';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export const RenderJson = ({ data }) => {
  return (
    <JsonView
      data={data}
      shouldExpandNode={allExpanded}
      style={defaultStyles}
    />
  );
};
