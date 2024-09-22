import React from "react";
import { Link } from "react-router-dom";
import { CommentIcon, HomeIcon, SignInIcon } from "@primer/octicons-react";
import { useMediaQuery } from "react-responsive";
import { Tooltip } from "@primer/react/next";
import Sizes from "open-props/src/sizes";
import OpenProps from "open-props";
import { useTranslation } from "react-i18next";

import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import { CreateMenu } from "create/blocks/CreateMenu";
import { RoutePaths } from "auth/client/routes";
import { circleButtonStyle } from "render/button/style";

// 内联 CircleButton 组件
const CircleButton = ({ tooltip, icon, to }) => {
  const buttonStyle = {
    ...circleButtonStyle,
    color: "inherit",
  };

  const iconStyle = {
    color: "#24292e", // 调整为您想要的颜色
  };

  return (
    <Tooltip text={tooltip} direction="w">
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        <button style={buttonStyle} onClick={(e) => e.preventDefault()}>
          <span style={iconStyle}>
            {React.cloneElement(icon, { style: iconStyle })}
          </span>
        </button>
      </Link>
    </Tooltip>
  );
};

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
        zIndex: 1000,
      }}
    >
      <CircleButton tooltip="回到首页" icon={<HomeIcon size={24} />} to="/" />

      {isLoggedIn && <CreateMenu />}

      <CircleButton
        tooltip="chat"
        icon={<CommentIcon size={24} />}
        to="/chat"
      />

      {isLoggedIn ? (
        <IsLoggedInMenu />
      ) : (
        <CircleButton
          tooltip={t("login")}
          icon={<SignInIcon size={24} />}
          to={RoutePaths.LOGIN}
        />
      )}
    </div>
  );
};
