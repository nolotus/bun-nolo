import React, { useContext } from "react";
import { deleteUser } from "user/client/delete";
import { UserContext } from "user/UserContext";

const AccountSettings = () => {
  const { currentUser, logout } = useContext(UserContext);

  const handleDeleteAccountClick = () => {
    //todo add modal tip
    deleteUser(currentUser?.userId)
      .then((result) => {
        console.log(result);
        logout();
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
        // 弹出错误信息
      });
  };

  return (
    <div>
      <h1>账号设置</h1>
      <button
        onClick={handleDeleteAccountClick}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        删除账号
      </button>
    </div>
  );
};

export default AccountSettings;
