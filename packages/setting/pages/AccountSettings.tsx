import React from "react";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { signOut } from "auth/authSlice";
import { useDeleteUserMutation } from "auth/services";
import Button from "web/ui/Button";

const AccountSettings = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  const handleDeleteAccountClick = async () => {
    try {
      await deleteUser({ userId: auth.user?.userId }).unwrap();
      dispatch(signOut());
    } catch (error) {
      alert("Failed to delete account. Please try again later.");
    }
  };

  return (
    <div className="settings-container">
      <h1>账号设置</h1>
      <div className="settings-content">
        <Button
          onClick={handleDeleteAccountClick}
          loading={isLoading}
          status="error"
        >
          删除账号
        </Button>
      </div>

      <style>{`
        .settings-container {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-container h1 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .settings-content {
          padding: 24px;
          border-radius: 8px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;
