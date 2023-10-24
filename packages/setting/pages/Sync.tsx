import React, { useState, useEffect, useCallback, useContext } from "react";
import StringToArrayInput from "components/Form/StringToArrayInput";

import { readOwnData } from "database/client/read";
import { UserContext } from "user/UserContext";
import { saveData } from "database/client/save";

export function useUserData(dataName) {
  const { currentUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const fetchData = useCallback(async () => {
    if (currentUser?.userId && dataName) {
      const result = await readOwnData(currentUser.userId, dataName, {
        isJSON: true,
      });
      setUserData(result);
    }
  }, [currentUser, dataName]);

  useEffect(() => {
    currentUser && fetchData();
  }, [currentUser, fetchData]);

  return userData;
}
export const useProfileData = (customId: string) => {
  const data = useUserData(customId);
  console.log("data", data);
  const [formData, setFormData] = useState(data);
  const [error, setError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    try {
      const flags = { isJSON: true };
      await saveData(formData, customId, flags);
      setError(null);
    } catch (error) {
      console.error("保存失败:", error);
      setError("保存失败");
    }
  };

  return { formData, setFormData, handleSaveClick, error };
};

const Sync = () => {
  const customId = "syncSettings";
  const { formData, setFormData, handleSaveClick, error } =
    useProfileData(customId);
  console.log("formData", formData);
  return (
    <div>
      <h1>Sync</h1>
      <StringToArrayInput
        value={formData?.serverAddress || ""} // 使用 StringToArrayInput 处理服务器地址
        onChange={(value) => setFormData({ ...formData, serverAddress: value })}
        name="serverAddress"
        label="Server Address"
        placeholder="Enter server addresses (comma separated)"
        error={error}
      />
      <button
        onClick={handleSaveClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Save
      </button>
    </div>
  );
};

export default Sync;
