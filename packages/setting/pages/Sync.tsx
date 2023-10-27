import React, { useState, useEffect, useCallback } from "react";
import StringToArrayInput from "components/Form/StringToArrayInput";

import { readOwnData } from "database/client/read";
import { saveData } from "database/client/save";
import { useAuth } from "app/hooks";

export function useUserData(dataName) {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const fetchData = useCallback(async () => {
    if (auth.user?.userId && dataName) {
      const result = await readOwnData(auth.user.userId, dataName, {
        isJSON: true,
      });
      setUserData(result);
    }
  }, [auth.user, dataName]);

  useEffect(() => {
    auth.user && fetchData();
  }, [auth.user, fetchData]);

  return userData;
}
export const useProfileData = (customId: string) => {
  const auth = useAuth();
  const data = useUserData(customId);
  console.log("data", data);
  const [formData, setFormData] = useState(data);
  const [error, setError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    try {
      const flags = { isJSON: true };
      await saveData(auth.user?.userId, formData, customId, flags);
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
