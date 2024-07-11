import React from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import { parse } from "yaml";
import "react-json-view-lite/dist/index.css";

const Yaml = ({ value }) => {
  let json;
  try {
    json = parse(value);
  } catch (error) {
    return <div>{value}</div>;
  }

  return (
    <div>
      <JsonView
        data={json}
        shouldExpandNode={allExpanded}
        style={defaultStyles}
      />
    </div>
  );
};

export default Yaml;
