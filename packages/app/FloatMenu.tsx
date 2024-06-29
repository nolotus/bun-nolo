import React from "react";
import { CommentIcon, HomeIcon, SignInIcon } from "@primer/octicons-react";
import { useMediaQuery } from "react-responsive";
import Sizes from "open-props/src/sizes";
import { useNavigate } from "react-router-dom";

import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import { CreateMenu } from "create/blocks/CreateMenu";

import { RoutePaths } from "auth/client/routes";
import OpenProps from "open-props";
import { Tooltip } from "@primer/react/next";
import { circleButtonStyle } from "render/button/style";
import { useTranslation } from "react-i18next";

export const FloatMenu = () => {
  const navigate = useNavigate();
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
      <Tooltip text={"回到首页"} direction="n">
        <button
          type="button"
          style={circleButtonStyle}
          onMouseDown={() => {
            navigate("/");
          }}
        >
          <HomeIcon />
        </button>
      </Tooltip>

      {isLoggedIn && <CreateMenu />}

      <Tooltip text={"chat"} direction="n">
        <button
          type="button"
          style={circleButtonStyle}
          onMouseDown={() => {
            navigate("/chat");
          }}
        >
          <CommentIcon />
        </button>
      </Tooltip>

      {isLoggedIn ? (
        <IsLoggedInMenu />
      ) : (
        <Tooltip text={t("login")} direction="n">
          <button
            style={circleButtonStyle}
            onClick={() => {
              navigate(RoutePaths.LOGIN);
            }}
          >
            <SignInIcon size={24} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
