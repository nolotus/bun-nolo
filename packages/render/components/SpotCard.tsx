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
            box-shadow: 0 2px 16px rgba(0, 158, 231, 0.1);
            width: 90%;
            max-width: 380px;
            margin: 0 auto;
            margin-bottom: 24px;
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            background: linear-gradient(to bottom, #ffffff, #f0f9ff);
            text-decoration: none;
            border: 1px solid rgba(0, 158, 231, 0.1);
          }
          
          @media (max-width: 768px) {
            .spot-card {
              width: 94%;
              margin-bottom: 16px;
              border-radius: 16px;
            }
          }

          @media (hover: hover) {
            .spot-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 8px 24px rgba(0, 158, 231, 0.2);
            }
          }

          .spot-image {
            position: relative;
            width: 100%;
            padding-top: 66.67%; /* 3:2 比例 */
            overflow: hidden;
          }

          .spot-image img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .spot-image::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(to top, rgba(255,255,255,0.8), transparent);
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
                background: "linear-gradient(135deg, #e0f7ff 0%, #87CEEB 100%)",
              }}
            />
          )}
        </div>

        <div
          style={{
            padding: "clamp(16px, 4vw, 24px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <h3
              style={{
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
                fontWeight: "700",
                color: "#006994",
                flex: "1",
                minWidth: 0,
              }}
            >
              {data.title}
            </h3>

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
                  width: "clamp(32px, 8vw, 38px)",
                  height: "clamp(32px, 8vw, 38px)",
                  borderRadius: "50%",
                  border: "2px solid #009ee7",
                }}
              />
              <p
                style={{
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "clamp(0.85rem, 3vw, 0.95rem)",
                  color: "#4A90E2",
                  fontWeight: "500",
                  maxWidth: "80px",
                }}
              >
                {data.creator || "未知"}
              </p>
            </div>
          </div>
        </div>
      </NavLink>
    </>
  );
};
