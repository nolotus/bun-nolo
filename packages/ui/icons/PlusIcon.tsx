import React from "react";

export const PlusIcon = (props) => {
  return (
    <svg viewBox="0 0 50 50" className={props?.className} fill="currentColor">
      <path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" />
      <path d="M16 24h18v2H16z" />
      <path d="M24 16h2v18h-2z" />
    </svg>
  );
};
