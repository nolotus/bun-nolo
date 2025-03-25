import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "web/ui/Button";
import { FaUsers } from "react-icons/fa"; // 从 react-icons 导入用户图标

const SpaceHome: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const validTypes = [
      "text/plain",
      "text/markdown",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.some((type) => fileType.includes(type))) {
      alert("不支持的文件类型，请上传txt、markdown、pdf、doc或excel文件");
      return;
    }

    // 这里可以添加实际的文件处理逻辑
    alert(
      `成功导入文件: ${file}\n文件类型: ${fileType}\n将上传到空间ID: ${spaceId}`
    );

    // 重置文件输入，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleMembersClick = () => {
    navigate(`/space/${spaceId}/members`); // 导航到成员管理页面
  };

  return (
    <div className="space-home">
      <h1>欢迎来到空间 #{spaceId}</h1>
      <div className="space-content">
        <p>这是空间 {spaceId} 的首页</p>
        <div className="space-actions">
          <button onClick={() => alert("功能开发中")}>编辑空间</button>
          <a href={`/space/${spaceId}/settings`}>空间设置</a>
          <button onClick={triggerFileInput}>导入文件</button>
          <Button
            onClick={handleMembersClick}
            variant="secondary"
            icon={<FaUsers size={14} />}
          >
            成员管理
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".txt,.md,.markdown,.pdf,.doc,.docx,.xls,.xlsx"
          />
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
          flex-wrap: wrap;
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
