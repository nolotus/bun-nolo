import React from "react";
import { useParams } from "react-router-dom";

const SpaceHome: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();

  return (
    <div className="space-home">
      <h1>欢迎来到空间 #{spaceId}</h1>
      <div className="space-content">
        <p>这是空间 {spaceId} 的首页</p>
        <div className="space-actions">
          <button onClick={() => alert("功能开发中")}>编辑空间</button>
          <a href={`/space/${spaceId}/settings`}>空间设置</a>
        </div>
      </div>
      <style>{`
        .space-home {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .space-content {
          margin-top: 20px;
        }
        .space-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        a {
          padding: 8px 16px;
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default SpaceHome;
