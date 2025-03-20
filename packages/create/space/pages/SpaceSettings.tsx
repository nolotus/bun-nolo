import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useEffect, useState } from "react";
import {
  updateSpace,
  deleteSpace,
  addMember,
  removeMember,
} from "create/space/spaceSlice";
import { PlusIcon, TrashIcon, PencilIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import { ConfirmModal } from "web/ui/ConfirmModal";
import toast from "react-hot-toast";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import { InviteModal } from "../InviteModal";
import { MemberList } from "../MemberList";
import { useSpaceData } from "../hooks/useSpaceData";
import { MemberRole } from "create/space/types";
import { createUserKey } from "database/keys";
import { read } from "database/dbSlice";

interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  avatar?: string;
}

const SpaceSettings = () => {
  const theme = useTheme();
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { spaceData, loading, error } = useSpaceData(spaceId!);
  const [name, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (spaceData) {
      setSpaceName(spaceData.name);
      setDescription(spaceData.description || "");
      setVisibility(spaceData.visibility);
      setMembers(spaceData.members);
    }
  }, [spaceData]);

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
    if (!spaceData) return; // 如果没有spaceData，不允许更新
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
      toast.success("更新成功");
    } catch (err) {
      toast.error("更新失败");
    } finally {
      setUpdating(false);
    }
  };

  const handleInviteMember = async (userId: string, role: string) => {
    if (!spaceData) return; // 如果没有spaceData，不允许邀请
    try {
      const mappedRole =
        role === "viewer" ? MemberRole.GUEST : MemberRole.MEMBER;

      await dispatch(
        addMember({
          spaceId: spaceId!,
          memberId: userId,
          role: mappedRole,
        })
      ).unwrap();

      toast.success("邀请已发送");
      setShowInviteModal(false);

      let userProfile;
      try {
        const profileKey = createUserKey.profile(userId);
        userProfile = await dispatch(read(profileKey)).unwrap();
      } catch (err) {
        console.warn(`Failed to fetch userProfile for ${userId}:`, err);
        userProfile = null;
      }

      const newMember: Member = {
        id: userId,
        name: userProfile?.nickname || userId,
        email: userProfile?.email || "",
        role: mappedRole,
        joinedAt: new Date().toISOString(),
        avatar: userProfile?.avatar || undefined,
      };
      setMembers([...members, newMember]);
    } catch (err) {
      toast.error("邀请失败");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!spaceData) return; // 如果没有spaceData，不允许移除
    try {
      setRemovingMemberId(memberId);
      await dispatch(
        removeMember({
          spaceId: spaceId!,
          memberId,
        })
      ).unwrap();

      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("成员已移除");
    } catch (err) {
      toast.error("移除失败: " + (err.message || "未知错误"));
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

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

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        loading={false}
      />

      <div className="settings-header">
        <h1>空间设置</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>基本信息</h2>
          {error || !spaceData ? (
            <div className="not-found">
              {error ? `错误: ${error.message}` : "未找到空间数据"}
            </div>
          ) : (
            <div className="settings-form">
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
                  placeholder="描述这个空间..."
                />
              </div>

              <div className="form-group">
                <label>访问权限</label>
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as "public" | "private")
                  }
                >
                  <option value="private">私有</option>
                  <option value="public">公开</option>
                </select>
              </div>

              <div className="form-group">
                <label>空间ID</label>
                <div className="readonly-value">{spaceData.id}</div>
              </div>

              <div className="form-group">
                <label>创建时间</label>
                <div className="readonly-value">
                  {new Date(spaceData.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            {spaceData && (
              <Button
                onClick={handleUpdate}
                loading={updating}
                disabled={
                  !name ||
                  (name === spaceData.name &&
                    description === spaceData.description &&
                    visibility === spaceData.visibility)
                }
                icon={<PencilIcon />}
              >
                保存修改
              </Button>
            )}

            <Button
              status="error"
              onClick={() => setShowDeleteModal(true)}
              icon={<TrashIcon />}
            >
              删除空间
            </Button>
          </div>
        </div>

        {spaceData && (
          <div className="settings-section">
            <div className="section-header">
              <h2>成员管理</h2>
              <Button
                onClick={() => setShowInviteModal(true)}
                icon={<PlusIcon />}
              >
                邀请成员
              </Button>
            </div>

            <MemberList
              members={members}
              ownerId={spaceData.ownerId}
              onRemove={handleRemoveMember}
              removingId={removingMemberId}
            />
          </div>
        )}
      </div>

      <style>{`
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
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
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

        .readonly-value {
          padding: 8px 12px;
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        select {
          padding: 8px 12px;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          background: ${theme.background};
          color: ${theme.text};
          font-size: 14px;
          transition: all 0.2s ease;
        }

        select:hover {
          border-color: ${theme.borderHover};
        }

        select:focus {
          border-color: ${theme.primary};
          outline: none;
        }

        .action-buttons {
          margin-top: 24px;
          display: flex;
          gap: 12px;
        }

        .loading,
        .error,
        .not-found {
          text-align: center;
          padding: 48px;
          color: ${theme.textSecondary};
        }

        .error {
          color: ${theme.error};
        }
      `}</style>
    </div>
  );
};

export default SpaceSettings;
