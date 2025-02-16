// create/space/SpaceSettings.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useEffect, useState } from "react";
import { read } from "database/dbSlice";
import { updateSpace, deleteSpace } from "create/space/spaceSlice";

import Button from "web/ui/Button";
import { ConfirmModal } from "web/ui/ConfirmModal";
import { createSpaceKey } from "database/keys";

export const useSpaceData = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const [spaceData, setSpaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const spaceKey = createSpaceKey.space(spaceId);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(read(spaceKey)).unwrap();
        setSpaceData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (spaceId) {
      fetchData();
    }
  }, [spaceId, dispatch]);

  return { spaceData, loading, error };
};

interface SpaceData {
  name: string;
  spaceId: string;
  createdAt: string;
  visibility: string;
}

const SpaceSettings = () => {
  const theme = useTheme();
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { spaceData, loading, error } = useSpaceData(spaceId);
  const [name, setSpaceName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (spaceData) {
      setSpaceName(spaceData.name);
    }
  }, [spaceData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!spaceData) return <div>No data found</div>;

  const handleDelete = async () => {
    try {
      await dispatch(deleteSpace(spaceId)).unwrap();
      navigate("/create");
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await dispatch(
        updateSpace({
          spaceId,
          name,
        })
      ).unwrap();
    } catch (err) {
      console.error("更新失败:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-settings">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="删除空间"
        message="确定要删除该空间吗？此操作不可恢复。"
        status="error"
        confirmText="删除"
        cancelText="取消"
      />

      <div className="settings-header">
        <h1>空间设置</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>基本信息</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>空间名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="输入空间名称"
              />
            </div>
            <div className="form-group">
              <label>空间创建时间</label>
              <div>{new Date(spaceData.createdAt).toLocaleString()}</div>
            </div>
            <div className="form-group">
              <label>空间ID</label>
              <div>{spaceData.spaceId}</div>
            </div>
            <div className="form-group">
              <label>访问权限</label>
              <div>{spaceData.visibility}</div>
            </div>
          </div>

          <div className="action-buttons">
            <Button
              onClick={handleUpdate}
              loading={updating}
              disabled={!name || name === spaceData.name}
            >
              保存修改
            </Button>

            <Button status="error" onClick={() => setShowDeleteModal(true)}>
              删除空间
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .space-settings {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: ${theme.text};
        }

        .settings-section {
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .settings-section h2 {
          font-size: 18px;
          font-weight: 500;
          color: ${theme.text};
          margin-bottom: 16px;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.textSecondary};
        }

        input {
          padding: 8px 12px;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          background: ${theme.background};
          color: ${theme.text};
          font-size: 14px;
          transition: all 0.2s ease;
        }

        input:hover {
          border-color: ${theme.borderHover};
        }

        input:focus {
          border-color: ${theme.primary};
          outline: none;
        }

        .action-buttons {
          margin-top: 24px;
          display: flex;
          gap: 12px;
        }
      `}</style>
    </div>
  );
};

export default SpaceSettings;
