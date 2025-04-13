import React from "react";
import PubCybots from "ai/cybot/web/PubCybots";

const Models: React.FC = () => {
  return (
    <div className="models-page">
      <h1>探索更多cybot</h1>
      <div className="models-content">
        <PubCybots limit={30} />
      </div>
      <style>{`
        .models-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .models-content {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Models;
