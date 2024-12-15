import { SpotCard } from "render/components/SpotCard";
import { useQueryData } from "app/hooks/useQueryData";
import { DataType } from "create/types";
import React from "react";

export const SpotList = ({ userId }) => {
  const queryConfig = {
    queryUserId: userId,
    options: {
      isJSON: true,
      condition: {
        type: DataType.SurfSpot,
      },
      limit: 20,
    },
  };

  const { data, isLoading } = useQueryData(queryConfig);

  return (
    <>
      <style>
        {`
          .spots-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
            max-width: 1440px;
            margin: 0 auto;
            padding: 24px;
          }

          @media (max-width: 768px) {
            .spots-container {
              gap: 20px;
              padding: 16px;
            }
          }

          @keyframes wave {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            background: linear-gradient(to bottom, #f0f9ff, #ffffff);
            border-radius: 16px;
          }

          .loading-wave {
            width: 40px;
            height: 40px;
            border: 3px solid #009ee7;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-wave"></div>
        </div>
      ) : (
        <div className="spots-container">
          {data
            ?.filter((spot) => !spot.is_template)
            .map((spot) => <SpotCard key={spot.id} data={spot} />)}
        </div>
      )}
    </>
  );
};
