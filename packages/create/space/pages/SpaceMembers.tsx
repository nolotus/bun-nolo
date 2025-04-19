import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { PlusIcon, PersonIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import toast from "react-hot-toast";
import { InviteModal } from "../components/InviteModal";
import { addMember, removeMember } from "../spaceSlice";
import { MemberRole } from "../types";
import { createUserKey } from "database/keys";
import { read } from "database/dbSlice";
import { useSpaceData } from "../hooks/useSpaceData";
import {
  FaTrash,
  FaUserCog,
  FaUserEdit,
  FaUserTimes,
  FaShieldAlt,
  FaUser,
  FaUserClock,
  FaUserPlus,
} from "react-icons/fa";
import EmptyState from "../components/EmptyState";

interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  avatar?: string;
}

const roleLabelMap = {
  [MemberRole.OWNER]: "拥有者",
  [MemberRole.ADMIN]: "管理员",
  [MemberRole.MEMBER]: "成员",
  [MemberRole.GUEST]: "访客",
};

const roleIconMap = {
  [MemberRole.OWNER]: <FaShieldAlt />,
  [MemberRole.ADMIN]: <FaUserCog />,
  [MemberRole.MEMBER]: <FaUser />,
  [MemberRole.GUEST]: <FaUserClock />,
};

const roleDescriptionMap = {
  [MemberRole.OWNER]: "完全控制空间的所有权限",
  [MemberRole.ADMIN]: "可以管理空间设置和成员",
  [MemberRole.MEMBER]: "可以查看和编辑空间内容",
  [MemberRole.GUEST]: "仅可查看空间内容",
};

const SpaceMembers: React.FC = () => {
  const theme = useTheme();
  const { spaceId } = useParams<{ spaceId: string }>();
  const dispatch = useAppDispatch();

  const { spaceData, loading, error } = useSpaceData(spaceId!);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (spaceData) {
      setMembers(spaceData.members || []);
    }
  }, [spaceData]);

  const handleInviteMember = async (userId: string, role: string) => {
    if (!spaceData) return;
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
    if (!spaceData) return;
    try {
      setRemovingMemberId(memberId);
      await dispatch(
        removeMember({
          spaceId: spaceId!,
          memberId,
        })
      ).unwrap();

      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("已移除成员");
    } catch (err) {
      toast.error("移除失败: " + (err.message || "未知错误"));
    } finally {
      setRemovingMemberId(null);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: MemberRole) => {
    // 这里应该有实际的API调用来更新角色，这里只是模拟
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );

      setEditMemberId(null);
      toast.success("成员角色已更新");
    } catch (err) {
      toast.error("更新失败");
    }
  };

  if (loading) return <div className="loading-state">正在加载成员信息...</div>;

  return (
    <div className="space-members">
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        loading={false}
      />

      <div className="section">
        <div className="section-header">
          <div className="title-container">
            <div className="title-icon">
              <FaUserCog />
            </div>
            <h2 className="section-title">成员管理</h2>
          </div>
          <Button onClick={() => setShowInviteModal(true)} icon={<PlusIcon />}>
            邀请成员
          </Button>
        </div>

        {error || !spaceData ? (
          <div className="error-state">
            <h3>无法加载成员信息</h3>
            <p>{error ? error.message : "未找到空间数据"}</p>
          </div>
        ) : (
          <div className="members-container">
            {members.length > 0 ? (
              <div className="members-list">
                {members.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="member-header">
                      <div className="member-avatar">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <div
                            className="avatar-placeholder"
                            style={{
                              backgroundColor: stringToColor(
                                member.name || member.id
                              ),
                            }}
                          >
                            {getInitials(member.name || member.id)}
                          </div>
                        )}
                      </div>
                      <div className="member-info">
                        <div className="member-name">
                          {member.name}
                          {member.id === spaceData.ownerId && (
                            <span className="owner-badge">创建者</span>
                          )}
                        </div>
                        <div className="member-email">
                          {member.email || member.id}
                        </div>
                      </div>
                    </div>

                    <div className="member-body">
                      <div className="member-role">
                        {editMemberId === member.id ? (
                          <div className="role-selector">
                            <select
                              defaultValue={member.role}
                              onChange={(e) =>
                                updateMemberRole(
                                  member.id,
                                  e.target.value as MemberRole
                                )
                              }
                            >
                              <option value={MemberRole.ADMIN}>管理员</option>
                              <option value={MemberRole.MEMBER}>成员</option>
                              <option value={MemberRole.GUEST}>访客</option>
                            </select>
                            <button
                              className="cancel-edit-btn"
                              onClick={() => setEditMemberId(null)}
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="role-badge">
                            <span className="role-icon">
                              {roleIconMap[member.role]}
                            </span>
                            {roleLabelMap[member.role]}
                          </div>
                        )}
                      </div>

                      {member.id !== spaceData.ownerId && (
                        <div className="member-actions">
                          {editMemberId !== member.id && (
                            <button
                              className="action-button edit"
                              title="编辑权限"
                              onClick={() => setEditMemberId(member.id)}
                            >
                              <FaUserEdit />
                              <span>更改角色</span>
                            </button>
                          )}
                          <button
                            className="action-button remove"
                            title="移除成员"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingMemberId === member.id}
                          >
                            {removingMemberId === member.id ? (
                              <span className="loading-spinner"></span>
                            ) : (
                              <>
                                <FaUserTimes />
                                <span>移除</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaUserPlus />}
                title="邀请团队成员"
                description="邀请成员加入这个空间，一起协作和分享内容"
                actionText={
                  <>
                    <FaUserPlus style={{ marginRight: "8px" }} />
                    邀请成员
                  </>
                }
                onAction={() => setShowInviteModal(true)}
              />
            )}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <div className="title-container">
            <div className="title-icon">
              <FaShieldAlt />
            </div>
            <h2 className="section-title">角色权限</h2>
          </div>
        </div>
        <div className="roles-grid">
          {Object.entries(roleLabelMap).map(([role, label]) => (
            <div key={role} className="role-card">
              <div className="role-header">
                <div className="role-icon">
                  {roleIconMap[role as MemberRole]}
                </div>
                <div className="role-title">{label}</div>
              </div>
              <div className="role-description">
                {roleDescriptionMap[role as MemberRole]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .space-members {
          width: 100%;
        }

        .section {
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .title-container {
          display: flex;
          align-items: center;
        }

        .title-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${theme.backgroundHover};
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

        .members-container {
          border-radius: 16px;
          box-shadow:
            0 2px 8px ${theme.shadowLight},
            0 0 1px ${theme.shadow1};
          overflow: hidden;
        }

        .members-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          padding: 20px;
        }

        .member-card {
          background: ${theme.background};
          border-radius: 12px;
          overflow: hidden;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
          box-shadow: 0 1px 3px ${theme.shadowLight};
        }

        .member-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .member-header {
          padding: 16px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid ${theme.borderLight};
        }

        .member-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          overflow: hidden;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .member-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
        }

        .member-info {
          flex: 1;
          min-width: 0;
        }

        .member-name {
          font-weight: 600;
          margin-bottom: 4px;
          color: ${theme.text};
          display: flex;
          align-items: center;
        }

        .owner-badge {
          margin-left: 8px;
          font-size: 12px;
          padding: 2px 6px;
          background: ${theme.primaryLight};
          color: ${theme.primary};
          border-radius: 4px;
          font-weight: 500;
        }

        .member-email {
          font-size: 13px;
          color: ${theme.textSecondary};
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .member-body {
          padding: 16px;
        }

        .member-role {
          margin-bottom: 12px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          background: ${theme.backgroundHover};
          color: ${theme.textSecondary};
          border-radius: 8px;
          font-size: 14px;
          white-space: nowrap;
        }

        .role-icon {
          display: flex;
          align-items: center;
          margin-right: 6px;
          font-size: 14px;
        }

        .role-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-selector select {
          padding: 8px 10px;
          border: 1px solid ${theme.borderLight};
          border-radius: 8px;
          background: ${theme.background};
          color: ${theme.text};
          font-size: 14px;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 30px;
        }

        .cancel-edit-btn {
          border: none;
          background: transparent;
          color: ${theme.primary};
          cursor: pointer;
          font-size: 14px;
          padding: 0;
        }

        .member-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: ${theme.backgroundHover};
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        .action-button svg {
          margin-right: 6px;
        }

        .action-button:hover {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }

        .action-button.remove:hover {
          background: rgba(220, 38, 38, 0.1);
          color: rgba(220, 38, 38, 1);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-left-color: ${theme.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-state {
          background: rgba(220, 38, 38, 0.05);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04),
            0 0 1px rgba(0, 0, 0, 0.08);
        }

        .error-state h3 {
          color: rgba(220, 38, 38, 0.9);
          font-size: 18px;
          margin-bottom: 8px;
        }

        .error-state p {
          color: ${theme.textSecondary};
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .role-card {
          background: ${theme.background};
          border-radius: 16px;
          box-shadow:
            0 2px 8px ${theme.shadowLight},
            0 0 1px ${theme.shadow1};
          padding: 20px;
          transition: transform 0.2s;
        }

        .role-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .role-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .role-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: ${theme.backgroundHover};
          color: ${theme.primary};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }

        .role-title {
          font-weight: 600;
          color: ${theme.text};
          font-size: 16px;
        }

        .role-description {
          font-size: 14px;
          color: ${theme.textSecondary};
          line-height: 1.5;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: ${theme.textSecondary};
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .section-header button {
            width: 100%;
          }

          .members-list {
            grid-template-columns: 1fr;
          }

          .roles-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// 辅助函数：根据字符串生成颜色
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

// 辅助函数：获取姓名首字母
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default SpaceMembers;
