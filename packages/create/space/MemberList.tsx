import { TrashIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";

export const MemberList = ({
  members,
  currentUserId,
  onRemove,
  removingId,
}) => {
  console.log("members", members);
  return (
    <div className="member-list">
      {members.map((member) => (
        <div key={member.id} className="member-item">
          <div className="member-info">
            <div>{member.name}</div>
            <div className="member-email">{member.email}</div>
          </div>
          <div className="member-role">{member.role}</div>
          {member.id !== currentUserId && (
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
    </div>
  );
};
