import React from "react";
import { useProfileData } from "../useProfileData";
import StringToArrayInput from "components/Form/StringToArrayInput"; // 导入 StringToArrayInput 组件

const Sync = () => {
  const customId = "syncSettings";
  const { formData, setFormData, handleSaveClick, error } =
    useProfileData(customId);

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
