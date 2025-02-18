import React from "react";

export const Avatar = ({ name }) => {
  const isUser = name !== "robot";
  const bgColor = isUser ? "#3b82f6" : "#16a34a"; // 将颜色值直接赋给变量

  return (
    <div
      style={{
        height: "2rem", // 转换为 rem 单位
        width: "2rem", // 转换为 rem 单位
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        color: "white",
        backgroundColor: bgColor, // 使用变量
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
