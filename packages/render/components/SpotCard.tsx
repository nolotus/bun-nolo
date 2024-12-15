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
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            width: 100%;
            max-width: 360px; 
            margin: 0 auto;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.2s ease;
            background: #fff;
            text-decoration: none;
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
            padding-top: 75%; /* 4:3 ratio */
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
          }

          .creator {
            margin: 0;
            font-size: 0.9rem;
            color: #666;
          }

          @media (max-width: 768px) {
            .spot-card {
              max-width: 100%;
            }
            .title {
              font-size: 1rem;
            }
            .creator {
              font-size: 0.85rem;
            }
          }
        `}
      </style>

      <NavLink to={`/${data.id}`} className="spot-card">
        <div className="spot-image">
          {data.image ? (
            <img src={data.image} alt={data.title} loading="lazy" />
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

        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <h3 className="title">{data.title}</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <Avatar
                name={data.creator || "user"}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                }}
              />
              <p className="creator">{data.creator || "未知"}</p>
            </div>
          </div>
        </div>
      </NavLink>
    </>
  );
};
