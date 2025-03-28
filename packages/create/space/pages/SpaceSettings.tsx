// create/space/pages/SpaceSettings.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useEffect, useState } from "react";
import { updateSpace, deleteSpace } from "create/space/spaceSlice";
import {
  TrashIcon,
  PencilIcon,
  ShieldLockIcon,
  GlobeIcon,
} from "@primer/octicons-react";
import Button from "web/ui/Button";
import { ConfirmModal } from "web/ui/ConfirmModal";
import toast from "react-hot-toast";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import { useSpaceData } from "../hooks/useSpaceData";
import {
  FaCog,
  FaLock,
  FaGlobe,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const SpaceSettings: React.FC = () => {
  const theme = useTheme();
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { spaceData, loading, error } = useSpaceData(spaceId!);
  const [name, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (spaceData) {
      setSpaceName(spaceData.name);
      setDescription(spaceData.description || "");
      setVisibility(spaceData.visibility);
    }
  }, [spaceData]);

  // 检测是否有变更
  useEffect(() => {
    if (spaceData) {
      setHasChanges(
        name !== spaceData.name ||
          description !== (spaceData.description || "") ||
          visibility !== spaceData.visibility
      );
    }
  }, [name, description, visibility, spaceData]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteSpace(spaceId!)).unwrap();
      toast.success("空间已删除");
      navigate("/create");
    } catch (err) {
      toast.error("删除失败");
    }
  };

  const handleUpdate = async () => {
    if (!spaceData) return;
    try {
      setUpdating(true);
      await dispatch(
        updateSpace({
          spaceId: spaceId!,
          name,
          description,
          visibility,
        })
      ).unwrap();
      toast.success("设置已更新");
      setHasChanges(false);
    } catch (err) {
      toast.error("更新失败");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>正在加载空间信息...</span>
      </div>
    );
  }

  return (
    <div className="space-settings">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="删除空间"
        message="确定要删除该空间吗？此操作不可恢复，空间内的所有文件和数据将被永久删除。"
        status="error"
        confirmText="删除"
        cancelText="取消"
      />

      <div className="settings-header">
        <div className="section-title-container">
          <div className="section-icon">
            <FaCog />
          </div>
          <h2 className="section-title">空间设置</h2>
        </div>

        {hasChanges && (
          <div className="settings-changes-badge">有未保存的更改</div>
        )}
      </div>

      {error || !spaceData ? (
        <div className="error-container">
          <div className="error-state">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h3>无法加载空间信息</h3>
            <p>{error ? error.message : "未找到空间数据"}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="settings-card">
            <div className="card-header">
              <h3 className="card-title">基本信息</h3>
              <p className="card-description">管理空间的名称、描述等基本信息</p>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label>空间名称</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder="输入空间名称"
                />
              </div>

              <div className="form-group">
                <label>空间描述</label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述这个空间的用途..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3 className="card-title">访问权限</h3>
              <p className="card-description">
                设置谁可以访问和查看此空间的内容
              </p>
            </div>
            <div className="card-content">
              <div className="visibility-options">
                <div
                  className={`visibility-option ${
                    visibility === "private" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("private")}
                >
                  <div className="option-radio">
                    {visibility === "private" && (
                      <div className="radio-inner"></div>
                    )}
                  </div>
                  <div className="option-icon private">
                    <FaLock />
                  </div>
                  <div className="option-content">
                    <div className="option-title">私有</div>
                    <div className="option-description">
                      只有被邀请的成员可以访问此空间
                    </div>
                  </div>
                </div>

                <div
                  className={`visibility-option ${
                    visibility === "public" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("public")}
                >
                  <div className="option-radio">
                    {visibility === "public" && (
                      <div className="radio-inner"></div>
                    )}
                  </div>
                  <div className="option-icon public">
                    <FaGlobe />
                  </div>
                  <div className="option-content">
                    <div className="option-title">公开</div>
                    <div className="option-description">
                      所有人都可以查看，但只有成员可以编辑内容
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card info-card">
            <div className="card-header">
              <h3 className="card-title">空间详情</h3>
              <p className="card-description">查看空间的基本信息和元数据</p>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">空间ID</div>
                  <div className="info-value">{spaceData.id}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">创建时间</div>
                  <div className="info-value">
                    {new Date(spaceData.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">创建者</div>
                  <div className="info-value">{spaceData.ownerId}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">成员数量</div>
                  <div className="info-value">
                    {spaceData.members?.length || 0} 人
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button
              onClick={handleUpdate}
              loading={updating}
              disabled={!hasChanges}
              icon={<PencilIcon />}
            >
              保存更改
            </Button>
            {hasChanges && (
              <button
                className="cancel-button"
                onClick={() => {
                  // 重置为原始值
                  if (spaceData) {
                    setSpaceName(spaceData.name);
                    setDescription(spaceData.description || "");
                    setVisibility(spaceData.visibility);
                  }
                }}
              >
                取消更改
              </button>
            )}
          </div>

          <div className="danger-section">
            <div className="danger-card">
              <div className="danger-icon">
                <FaExclamationTriangle />
              </div>
              <div className="danger-content">
                <div className="danger-title">删除空间</div>
                <div className="danger-description">
                  此操作将永久删除空间内的所有文件、页面和数据，无法恢复。
                  {spaceData.members && spaceData.members.length > 1 && (
                    <div className="danger-warning">
                      注意：此空间有 {spaceData.members.length}{" "}
                      名成员。删除前请确保通知所有成员。
                    </div>
                  )}
                </div>
                <Button
                  status="error"
                  onClick={() => setShowDeleteModal(true)}
                  icon={<TrashIcon />}
                >
                  删除空间
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .space-settings {
          width: 100%;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title-container {
          display: flex;
          align-items: center;
        }

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${theme.backgroundSecondary};
          color: ${theme.primary};
          border-radius: 8px;
          margin-right: 12px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
        }

        .settings-changes-badge {
          background: ${theme.primaryLight};
          color: ${theme.primary};
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }

        .settings-card {
          background: ${theme.background};
          border-radius: 14px;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04),
            0 0 1px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .settings-card:hover {
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 0 1px rgba(0, 0, 0, 0.1);
        }

        .info-card {
          background: ${theme.backgroundSecondary};
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid ${theme.borderLight};
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0 0 8px 0;
        }

        .card-description {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin: 0;
        }

        .card-content {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.textSecondary};
          margin-bottom: 8px;
        }

        .visibility-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .visibility-option {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 10px;
          background: ${theme.backgroundSecondary};
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .visibility-option:hover {
          background: ${theme.backgroundTertiary};
        }

        .visibility-option.selected {
          background: ${theme.primaryLight};
          border-color: ${theme.primary};
        }

        .option-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid ${theme.borderLight};
          margin-right: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .selected .option-radio {
          border-color: ${theme.primary};
        }

        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${theme.primary};
        }

        .option-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          flex-shrink: 0;
          font-size: 16px;
        }

        .option-icon.private {
          background: rgba(220, 38, 38, 0.1);
          color: rgb(220, 38, 38);
        }

        .option-icon.public {
          background: rgba(37, 99, 235, 0.1);
          color: rgb(37, 99, 235);
        }

        .option-content {
          flex: 1;
        }

        .option-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: ${theme.text};
          font-size: 15px;
        }

        .option-description {
          font-size: 13px;
          color: ${theme.textSecondary};
          line-height: 1.4;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .info-item {
          background: ${theme.background};
          padding: 14px 16px;
          border-radius: 10px;
        }

        .info-label {
          font-size: 12px;
          color: ${theme.textTertiary};
          margin-bottom: 6px;
        }

        .info-value {
          font-size: 14px;
          color: ${theme.text};
          word-break: break-all;
          line-height: 1.4;
        }

        .form-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 40px 0;
        }

        .cancel-button {
          background: none;
          border: none;
          color: ${theme.textSecondary};
          font-size: 14px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .cancel-button:hover {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }

        .danger-section {
          margin-top: 12px;
        }

        .danger-card {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          background: rgba(220, 38, 38, 0.05);
          border-radius: 14px;
          border-left: 4px solid rgba(220, 38, 38, 0.8);
        }

        .danger-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.1);
          color: rgba(220, 38, 38, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .danger-content {
          flex: 1;
        }

        .danger-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(220, 38, 38, 0.9);
          margin-bottom: 8px;
        }

        .danger-description {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin-bottom: 16px;
        }

        .danger-warning {
          margin-top: 8px;
          padding: 10px;
          background: rgba(220, 38, 38, 0.08);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: ${theme.textSecondary};
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${theme.backgroundTertiary};
          border-radius: 50%;
          border-top-color: ${theme.primary};
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-container {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }

        .error-state {
          background: rgba(220, 38, 38, 0.05);
          border-radius: 14px;
          padding: 30px;
          text-align: center;
          max-width: 480px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .error-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.1);
          color: rgba(220, 38, 38, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px auto;
        }

        .error-state h3 {
          color: rgba(220, 38, 38, 0.9);
          font-size: 18px;
          margin-bottom: 10px;
        }

        .error-state p {
          color: ${theme.textSecondary};
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .visibility-options {
            gap: 12px;
          }

          .visibility-option {
            padding: 14px;
          }

          .card-header,
          .card-content {
            padding: 16px;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .form-actions button,
          .cancel-button {
            width: 100%;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .danger-card {
            flex-direction: column;
          }

          .danger-icon {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceSettings;
