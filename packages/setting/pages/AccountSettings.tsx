import React from "react";
// import { deleteUser } from "user/client/delete";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { signOut } from "auth/authSlice";
import { useDeleteUserMutation } from "auth/services";

const AccountSettings = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [deleteUser, { isLoading }] = useDeleteUserMutation(); // 使用钩子

  const handleDeleteAccountClick = async () => {
    try {
      // 调用删除用户的 mutation
      await deleteUser({ userId: auth.user?.userId }).unwrap();
      // 删除成功后,触发注销 action
      dispatch(signOut());
    } catch (error) {
      // 处理删除失败的错误
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again later.");
    }
  };

  return (
    <div>
      <h1>账号设置</h1>
      <button
        type="button"
        onClick={handleDeleteAccountClick}
        disabled={isLoading}
        className="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
      >
        删除账号
      </button>
    </div>
  );
};

export default AccountSettings;
