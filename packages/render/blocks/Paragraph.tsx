import React from "react";

const Paragraph = ({ children }) => {
  return (
    <p className="whitespace-pre-line " style={{ textAlign: "justify" }}>
      {children}
    </p>
  );
};

export default Paragraph;
