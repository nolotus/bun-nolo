import { TrashIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import { MemberRole } from "app/types";
import { useAppSelector } from "app/store"; // 导入 useAppSelector
import { selectUserId } from "auth/authSlice"; // 导入 selectUserId

export const MemberList = ({
  members,
  ownerId, // 仍然需要 ownerId 来判断当前用户是否是 owner
  onRemove,
  removingId,
}) => {
  const currentUserId = useAppSelector(selectUserId); // 直接获取当前用户 ID
  const isOwner = currentUserId === ownerId; // 判断当前用户是否是 owner

  return (
    <div className="member-list">
      {members.map((member) => (
        <div key={member.id} className={`member-item ${member.role}`}>
          <div className="member-info">
            <div className="member-name">
              {member.name}
              {member.role === MemberRole.OWNER && " (创建者)"}
            </div>
            <div className="member-email">{member.email || "未提供邮箱"}</div>
          </div>
          <div className="member-role">
            {member.role === MemberRole.OWNER
              ? "创建者"
              : member.role === MemberRole.ADMIN
                ? "管理员"
                : member.role === MemberRole.MEMBER
                  ? "成员"
                  : "访客"}
          </div>
          {/* 只有 owner 能移除其他成员，且不能移除自己 */}
          {isOwner && member.id !== currentUserId && (
            <Button
              status="error"
              icon={<TrashIcon />}
              onClick={() => onRemove(member.id)}
              loading={removingId === member.id}
            >
              移除
            </Button>
          )}
        </div>
      ))}
      <style jsx>{`
        .member-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-radius: 6px;
          background: #f9f9f9;
          transition: background 0.2s ease;
        }

        .member-item:hover {
          background: #f1f1f1;
        }

        .member-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .member-name {
          font-weight: 500;
          color: #333;
        }

        .member-email {
          font-size: 12px;
          color: #666;
        }

        .member-role {
          width: 80px;
          text-align: center;
          font-size: 14px;
          color: #555;
        }

        /* 根据角色添加不同样式 */
        .member-item.owner {
          background: #e6f3ff;
        }

        .member-item.admin {
          background: #fff3e6;
        }

        .member-item.member {
          background: #f0f0f0;
        }

        .member-item.guest {
          background: #f9f9f9;
        }
      `}</style>
    </div>
  );
};
