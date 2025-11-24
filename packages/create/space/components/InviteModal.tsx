import React, { useState } from "react";
import Button from "render/web/ui/Button";
import { BaseActionModal } from "render/web/ui/modal/BaseActionModal";

import { InfoIcon } from "@primer/octicons-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userId: string, role: string) => void;
  loading?: boolean;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  loading = false,
}) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("viewer");

  const handleInvite = () => {
    onInvite(userId, role);
  };

  const actions = (
    <>
      <Button
        onClick={onClose}
        variant="secondary"
        size="small"
        disabled={loading}
      >
        取消
      </Button>
      <Button
        onClick={handleInvite}
        size="small"
        loading={loading}
        disabled={loading}
      >
        邀请
      </Button>
    </>
  );

  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="邀请成员"
      titleIcon={<InfoIcon size={16} />}
      actions={actions}
      status="info"
      width={400}
    >
      <div className="invite-form">
        <div className="form-group">
          <label htmlFor="userId">用户ID</label>
          <input
            id="userId"
            type="text" // 修改了type，从email改为text
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="输入用户ID"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">角色</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="viewer">查看者</option>
            <option value="editor">编辑者</option>
          </select>
        </div>
      </div>

      <style jsx>{`
        .invite-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-weight: 500;
        }

        input,
        select {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--primary-color, #0066ff);
          box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.1);
        }
      `}</style>
    </BaseActionModal>
  );
};
