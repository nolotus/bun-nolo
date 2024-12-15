import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "render/ui";

export const SpotCard = ({ data }) => {
  return (
    <>
      <style>
        {`
          .spot-card {
            display: block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            width: 100%;
            max-width: 360px;
            margin: 0 auto;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.2s ease;
            background: #fff;
            text-decoration: none;
            border: 1px solid #eee;
          }
          
          @media (hover: hover) {
            .spot-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
            }
          }

          .spot-image {
            position: relative;
            width: 100%;
            padding-top: 66.67%; /* 3:2 ratio */
            background: #f5f5f5;
          }

          .spot-image img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .spot-content {
            padding: 16px;
          }

          .spot-header {
            display: flex;
            align-items: center;
            gap: 12px;
            justify-content: space-between;
          }

          .title {
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            flex: 1;
            min-width: 0;
            max-width: 200px;
          }

          .creator-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          .creator {
            margin: 0;
            font-size: 0.9rem;
            color: #666;
            max-width: 80px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          @media (max-width: 768px) {
            .spot-card {
              max-width: 100%;
            }
            .title {
              font-size: 1rem;
              max-width: 160px;
            }
            .creator {
              font-size: 0.85rem;
              max-width: 60px;
            }
            .avatar {
              width: 28px;
              height: 28px;
            }
            .spot-content {
              padding: 12px;
            }
          }
        `}
      </style>

      <NavLink to={`/${data.id}`} className="spot-card">
        <div className="spot-image">
          {data.image ? (
            <img
              src={data.image}
              alt={data.title}
              loading="lazy"
              onError={(e) => {
                e.target.src = "默认图片URL"; // 添加默认图片
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}
        </div>

        <div className="spot-content">
          <div className="spot-header">
            <h3 className="title" title={data.title}>
              {data.title}
            </h3>

            <div className="creator-wrapper">
              <Avatar name={data.creator || "user"} className="avatar" />
              <p className="creator" title={data.creator || "未知"}>
                {data.creator || "未知"}
              </p>
            </div>
          </div>
        </div>
      </NavLink>
    </>
  );
};
