import React, { lazy } from "react";

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.PrismLight,
  })),
);

export default SyntaxHighlighter;
