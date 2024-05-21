import { useAuth } from "auth/useAuth";
import StringToArrayInput from "components/Form/StringToArrayInput";
import { readOwnData } from "database/client/read";
import { saveData } from "database/client/save";
import { ServerIcon } from "@primer/octicons-react";

import React, { useState, useEffect, useCallback } from "react";

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
// const currentDomain = window.location.hostname;
// const port = window.location.port;
// const displayPort = port ? `:${port}` : "";
// const isDefaultDomain = currentDomain === "nolotus.com";

const Sync = () => {
  const customId = "syncSettings";
  const { formData, setFormData, handleSaveClick, error } =
    useProfileData(customId);
  console.log("formData", formData);
  return (
    <div>
      <h1>同步设置</h1>
      <h2>
        <ServerIcon size={24} />
        服务器设置
      </h2>
      主服务器 备份服务器
      <h2>点击同步时候</h2>
      <label htmlFor="serverAddress">您的自定义服务器</label>
      <StringToArrayInput
        value={formData?.serverAddress || ""}
        onChange={(value) => setFormData({ ...formData, serverAddress: value })}
        name="serverAddress"
        placeholder="Enter server addresses (comma separated)"
        error={error}
      />
      <button
        onClick={handleSaveClick}
        className="focus:shadow-outline mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Save
      </button>
      <h2>创建或编辑时</h2>
      <label htmlFor="serverAddress">您的自定义服务器</label>
      <StringToArrayInput
        value={formData?.serverAddress || ""}
        onChange={(value) => setFormData({ ...formData, serverAddress: value })}
        name="serverAddress"
        placeholder="Enter server addresses (comma separated)"
        error={error}
      />
      <button
        onClick={handleSaveClick}
        className="focus:shadow-outline mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Save
      </button>
      <h2>删除数据时</h2>
      <label htmlFor="serverAddress">您的自定义服务器</label>
      <StringToArrayInput
        value={formData?.serverAddress || ""}
        onChange={(value) => setFormData({ ...formData, serverAddress: value })}
        name="serverAddress"
        placeholder="Enter server addresses (comma separated)"
        error={error}
      />
      <button
        onClick={handleSaveClick}
        className="focus:shadow-outline mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Save
      </button>
    </div>
  );
};

export default Sync;
