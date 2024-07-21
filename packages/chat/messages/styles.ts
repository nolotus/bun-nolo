import OpenProps from "open-props";

export const messageContentWithAvatarGap = OpenProps.size3;
export const ChatContainerPaddingRight = OpenProps.size12;

export const messageWindowStyle = {
  display: "flex",
  width: "100%",
  flexDirection: "column",
  paddingLeft: OpenProps.size5,
  paddingRight: ChatContainerPaddingRight,
};
export const messageListStyle = {
  display: "flex",
  flexDirection: "column-reverse",
  gap: OpenProps.size2,
  overflow: "auto",
  height: "100vh",
  position: "relative",
};
