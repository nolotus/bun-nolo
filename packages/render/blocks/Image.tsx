import React from "react";

const Image = ({ src, alt }) => {
  console.log("src", src);
  return (
    <div>
      <img src={src} alt={alt} />
    </div>
  );
};

export default Image;
