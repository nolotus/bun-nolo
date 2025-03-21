import React from "react";

const Models: React.FC = () => {
  return (
    <div className="models-page">
      <h1>模型页面</h1>
      <div className="models-content">
        <p>这里展示所有模型的列表</p>
        {/* 这里可以添加模型列表的实现 */}
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
