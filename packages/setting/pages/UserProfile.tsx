import { useAuth } from "auth/useAuth";
import React from "react";
import { TrophyIcon } from "@primer/octicons-react";

import { useProfileData } from "../useProfileData"; // 确保路径正确

const UserProfile = () => {
  const auth = useAuth();
  const customId = "userProfile";
  const { formData, setFormData, handleSaveClick, error } =
    useProfileData(customId);

  return (
    <div className="rounded-lg bg-gray-100 p-8">
      <h1 className="mb-4 text-2xl font-semibold">个人资料</h1>
      <div className="mb-4">
        <p className="mb-2 text-lg">用户Id: {auth.user?.userId}</p>
        <p className="mb-2 text-lg">当前语言: {navigator.language}</p>

        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Avatar URL"
            value={formData?.avatar || ""}
            onChange={(e) =>
              setFormData({ ...formData, avatar: e.target.value })
            }
            className="rounded border p-2"
          />
          <textarea
            placeholder="Self Introduction"
            value={formData?.introduction || ""}
            onChange={(e) =>
              setFormData({ ...formData, introduction: e.target.value })
            }
            className="rounded border p-2"
          />
          <input
            type="text"
            placeholder="Personal Website"
            value={formData?.website || ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="rounded border p-2"
          />
        </div>
      </div>

      <h2>
         成就
        <TrophyIcon size={24} />
      </h2>
      <button
        onClick={handleSaveClick}
        className="focus:shadow-outline mb-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Save
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default UserProfile;
