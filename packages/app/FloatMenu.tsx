import React from "react";
import { useMediaQuery } from "react-responsive";
import Sizes from "open-props/src/sizes";

import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import { CreateMenu } from "create/blocks/CreateMenu";

import OpenProps from "open-props";
import { useTranslation } from "react-i18next";

export const FloatMenu = () => {
  const { t } = useTranslation();
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
      {isLoggedIn && (
        <>
          <CreateMenu /> <IsLoggedInMenu />
        </>
      )}
    </div>
  );
};
