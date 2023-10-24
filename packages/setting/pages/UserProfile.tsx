import React from "react";
import { useProfileData } from "../useProfileData"; // 确保路径正确
import { useAppSelector } from "app/hooks";

const UserProfile = () => {
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const customId = "userProfile";
  const { formData, setFormData, handleSaveClick, error } =
    useProfileData(customId);

  return (
    <div className="p-8 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">UserProfile</h1>
      <div className="mb-4">
        <p className="text-lg mb-2">userId: {currentUser?.userId}</p>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Avatar URL"
            value={formData?.avatar || ""}
            onChange={(e) =>
              setFormData({ ...formData, avatar: e.target.value })
            }
            className="p-2 border rounded"
          />
          <textarea
            placeholder="Self Introduction"
            value={formData?.introduction || ""}
            onChange={(e) =>
              setFormData({ ...formData, introduction: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Personal Website"
            value={formData?.website || ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>
      <button
        onClick={handleSaveClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
      >
        Save
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default UserProfile;
