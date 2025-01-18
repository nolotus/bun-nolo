import { SpotCard } from "render/components/SpotCard";

export const SpotList = () => {
  const data = [];
  const isLoading = false;

  return (
    <>
      <style>
        {`
          .spots-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          @media (max-width: 768px) {
            .spots-container {
              grid-template-columns: 1fr;
              gap: 16px;
              padding: 12px;
            }
          }

          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #eee;
            border-top-color: #666;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #666;
          }
        `}
      </style>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="spots-container">
          {data?.map((spot) => <SpotCard key={spot.id} data={spot} />)}
          {data?.length === 0 && (
            <div className="empty-state">
              <p>暂无冲浪点</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
