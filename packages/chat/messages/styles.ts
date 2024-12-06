import { layout } from "render/ui/layout";
import { sizes } from "render/ui/stylePresets";
// This file contains common styles used across different components in the chat interface.
// It includes styles for message containers, content wrappers, avatars, and context menus.
// These styles are exported as objects to be used with inline styling in React components.
// Constants
export const messageContentWithAvatarGap = sizes.size3;

// Styles for message input
export const messageInputStyle = {
  ...layout.flex,
  paddingLeft: sizes.sizeFluid4,
  paddingRight: sizes.sizeFluid4,
  maxWidth: "900px",
  margin: "auto",
  marginBottom: sizes.sizeFluid1,
};

// Common styles for message containers (both user and robot messages)
export const messageContainerStyle = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: sizes.size3,
  paddingTop: "10px",
  paddingBottom: "10px",
};

// Styles for the content wrapper inside message containers
export const contentWrapperStyle = {
  display: "flex",
  alignItems: "flex-start",
};

// Styles for the avatar wrapper
export const avatarWrapperStyle = {
  flexShrink: 0,
};

// Styles for the context menu
export const menuStyle = {
  position: "relative",
  zIndex: 50,
  display: "flex",
  maxHeight: "var(--popover-available-height)",
  minWidth: "180px",
  flexDirection: "column",
  overflow: "auto",
  overscrollBehavior: "contain",
  borderRadius: "0.5rem",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hsl(204 20% 88%)",
  backgroundColor: "white",
  padding: "0.5rem",
  color: "black",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  outline: "none !important",
};

// Styles for individual menu items
export const menuItemStyle = {
  display: "flex",
  cursor: "default",
  scrollMargin: "0.5rem",
  alignItems: "center",
  gap: "0.5rem",
  borderRadius: "0.25rem",
  padding: "0.5rem",
  outline: "none !important",
};

// Styles for menu separators
export const menuSeparatorStyle = {
  marginTop: "0.5rem",
  marginBottom: "0.5rem",
  height: "0px",
  width: "100%",
  borderTopWidth: "1px",
  borderColor: "hsl(204 20% 88%)",
};
