import { useAuth } from "auth/useAuth";
import StringToArrayInput from "components/Form/StringToArrayInput";
import { readOwnData } from "database/client/read";
import { saveData } from "database/client/save";
import { ServerIcon } from "@primer/octicons-react";

import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer, selectSyncServer } from "../settingSlice";

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
  const currentServer = useAppSelector(selectCurrentServer);
  const syncServer = useAppSelector(selectSyncServer);
  return (
    <div>
      <h2 style={{ fontSize: "1.5em", fontWeight: "bold" }}>同步设置</h2>
      <h3
        style={{
          fontSize: "1.2em",
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <ServerIcon size={24} />
        <span style={{ marginLeft: "10px" }}>服务器设置</span>
      </h3>
      <div style={{ marginTop: "10px" }}>主服务器: {currentServer}</div>
      <div style={{ marginTop: "10px" }}>
        备份服务器:
        {syncServer.map((server, index) => (
          <div
            key={index}
            style={{
              padding: "5px",
              backgroundColor: "#f9f9f9",
              marginTop: "5px",
            }}
          >
            {server}
          </div>
        ))}
      </div>
      {/* <label htmlFor="serverAddress">您的自定义服务器</label>
      <StringToArrayInput
        value={formData?.serverAddress || ""}
        onChange={(value) => setFormData({ ...formData, serverAddress: value })}
        name="serverAddress"
        placeholder="Enter server addresses (comma separated)"
        error={error}
      />
      <button
        onClick={handleSaveClick}
        className="focus:shadow-outline primary mt-4  rounded px-4 py-2 font-bold"
      >
        Save
      </button> */}
    </div>
  );
};

export default Sync;
