// This file contains common styles used across different components in the chat interface.
// It includes styles for message containers, content wrappers, avatars, and context menus.
// These styles are exported as objects to be used with inline styling in React components.
// Constants
export const messageContentWithAvatarGap = "1rem";

// Styles for message input

// Common styles for message containers (both user and robot messages)
export const messageContainerStyle = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "16px",
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
