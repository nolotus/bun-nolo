import { useAuth } from "auth/useAuth";
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  const auth = useAuth();
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="mb-4 ">个人资料</h3>
      <div className="mb-4">
        <p className="mb-2 ">用户名: {auth.user?.username}</p>
        <p className="mb-2 ">用户Id: {auth.user?.userId}</p>
        <p className="mb-2 ">用户email: {auth.user?.email}</p>
      </div>
    </div>
  );
};

export default UserProfile;
