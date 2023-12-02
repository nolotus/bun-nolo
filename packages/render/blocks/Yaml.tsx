import React from 'react';
import { parse } from 'yaml';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';

const Yaml = ({ value }) => {
  let json;
  try {
    json = parse(value);
  } catch (error) {
    console.error('解析YAML出错：', error);
    return <div>{value}</div>;
  }

  return (
    <div>
      <JsonView data={json} shouldExpandNode={allExpanded} style={defaultStyles} />
    </div>
  );
};

export default Yaml;