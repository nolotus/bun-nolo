import React from 'react';

export const CloseIcon = props => {
  return (
    <svg viewBox="0 0 50 50" className={props?.className} fill="currentColor">
      <path d="M37.304 11.282l1.414 1.414-26.022 26.02-1.414-1.413z" />
      <path d="M12.696 11.282l26.022 26.02-1.414 1.415-26.022-26.02z" />
    </svg>
  );
};
