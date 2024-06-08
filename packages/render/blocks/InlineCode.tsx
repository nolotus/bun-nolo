import React from "react";
import Fonts from "open-props/src/fonts";

const InlineCode = ({ value }) => (
  <code style={{ fontSize: Fonts["--font-size-1"] }}>{value}</code>
);

export default InlineCode;
