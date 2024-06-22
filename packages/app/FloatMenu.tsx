import React from "react";
import { CommentIcon, HomeIcon, SignInIcon } from "@primer/octicons-react";
import { useMediaQuery } from "react-responsive";
import Sizes from "open-props/src/sizes";
import Borders from "open-props/src/borders";
import { useNavigate } from "react-router-dom";

import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import { CreateMenu } from "create/blocks/CreateMenu";

import { RoutePaths } from "auth/client/routes";
import OpenProps from "open-props";

export const FloatMenu = () => {
  const navigate = useNavigate();
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
      <button
        type="button"
        className="p-[10px]"
        style={{
          borderRadius: Borders["--radius-round"],
        }}
        onMouseDown={() => {
          navigate("/");
        }}
      >
        <HomeIcon />
      </button>
      {isLoggedIn && <CreateMenu />}
      <button
        type="button"
        className="p-[10px]"
        style={{
          borderRadius: Borders["--radius-round"],
        }}
        onMouseDown={() => {
          navigate("/chat");
        }}
      >
        <CommentIcon />
      </button>

      {isLoggedIn ? (
        <IsLoggedInMenu />
      ) : (
        <div>
          <button
            className="p-[10px]"
            style={{
              borderRadius: OpenProps.radiusRound,
              boxShadow: OpenProps.shadow5,
            }}
            onClick={() => {
              navigate(RoutePaths.LOGIN);
            }}
          >
            <SignInIcon size={24} />
            {/* {t("login")} */}
          </button>
        </div>
      )}
    </div>
  );
};
