import React from "react";
import { CommentIcon, HomeIcon, SignInIcon } from "@primer/octicons-react";
import { useMediaQuery } from "react-responsive";
import Sizes from "open-props/src/sizes";

import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import { CreateMenu } from "create/blocks/CreateMenu";

import { RoutePaths } from "auth/client/routes";
import OpenProps from "open-props";
import { useTranslation } from "react-i18next";
import { CircleButton } from "render/button/CircleButton";

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
      <CircleButton
        tooltip="回到首页"
        icon={<HomeIcon size="medium" />}
        to="/"
      />

      {isLoggedIn && <CreateMenu />}

      <CircleButton
        tooltip="chat"
        icon={<CommentIcon size="medium" />}
        to="/chat"
      />

      {isLoggedIn ? (
        <IsLoggedInMenu />
      ) : (
        <CircleButton
          tooltip={t("login")}
          icon={<SignInIcon size="small" />}
          to={RoutePaths.LOGIN}
        />
      )}
    </div>
  );
};
