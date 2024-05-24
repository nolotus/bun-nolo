import React, { useState, useEffect } from "react";

export const MessageImage: React.FC<{ url: string }> = ({ url }) => (
  <picture>
    <source srcSet={url} />
    <img
      src={url}
      alt="Message"
      className="h-auto max-w-full"
      style={{
        blockSize: "480px",
        aspectRatio: "var(--ratio-landscape)",
      }}
    />
  </picture>
);
