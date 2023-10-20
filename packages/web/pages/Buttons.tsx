import React, { Suspense } from "react";

import { Button } from "ui";

export const Buttons = React.lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    default: Button,
  };
});
