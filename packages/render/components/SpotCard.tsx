import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "render/ui";
import { themeStyles } from "../ui/styles";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

export const SpotCard = ({ data }) => {
  const theme = useAppSelector(selectTheme);
  return (
    <NavLink
      to={`/${data.id}`}
      style={{
        display: "block",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "300px", // 硬编码宽度
        margin: "0 auto", // 居中以适应手机屏幕
        marginBottom: "16px", // 增加底部间距
        borderRadius: "8px", // 增加圆角，更适合手机端
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex" }}>
        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            style={{
              height: "192px", // 硬编码高度
              width: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              height: "192px",
              alignItems: "center",
              justifyContent: "center",
              width: "300px", // 硬编码宽度
              ...themeStyles.surface1(theme),
            }}
          />
        )}
      </div>
      <div style={{ padding: "16px" }}>
        <div
          style={{
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1.125rem", // 18px
              width: "70%",
            }}
          >
            {data.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "30%", // 采用比例来适应不同屏幕大小
              overflow: "hidden",
            }}
          >
            <Avatar name={data.creator || "user"} />
            <p
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "0.75rem", // 12px
              }}
            >
              {data.creator ? data.creator : "未知"}
            </p>
          </div>
        </div>
      </div>
    </NavLink>
  );
};
