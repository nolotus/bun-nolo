import React from 'react';
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';

export const RenderJson = ({ data }) => {
  return <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />
 
};
