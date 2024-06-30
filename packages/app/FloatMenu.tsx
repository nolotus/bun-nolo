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
import { Button } from "render/ui";

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
        <div>
          <Button
            style={circleButtonStyle}
            icon={<HomeIcon size={"small"} />}
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
      </Tooltip>

      {isLoggedIn && <CreateMenu />}

      <Tooltip text={"mine"} direction="n">
        <div>
          <Button
            style={circleButtonStyle}
            icon={<CommentIcon />}
            onClick={() => {
              navigate("/chat");
            }}
          />
        </div>
      </Tooltip>

      {isLoggedIn ? (
        <IsLoggedInMenu />
      ) : (
        <Tooltip text={t("login")} direction="n">
          <div>
            <Button
              style={circleButtonStyle}
              icon={<SignInIcon />}
              onClick={() => {
                navigate(RoutePaths.LOGIN);
              }}
            />
          </div>
        </Tooltip>
      )}
    </div>
  );
};
