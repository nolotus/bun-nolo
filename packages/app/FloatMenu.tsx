import React from "react";
import { useMediaQuery } from "react-responsive";
import Sizes from "open-props/src/sizes";

import { useAuth } from "auth/useAuth";
import { CreateMenu } from "create/blocks/CreateMenu";

import OpenProps from "open-props";

export const FloatMenu = () => {
  const laptop = useMediaQuery({ minWidth: 768, maxWidth: 1280 });
  const { isLoggedIn } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        bottom: Sizes["--size-fluid-6"],
        right: laptop ? OpenProps.sizeFluid2 : OpenProps.sizeFluid3,
        gap: Sizes["--size-relative-7"],
      }}
    >
      {isLoggedIn && <CreateMenu />}
    </div>
  );
};
