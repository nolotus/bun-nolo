import React, { useState } from "react";
import { saveData } from "database/client/save";

import { Toggle } from "ui";
import { Button } from "ui/Button";
import { useUserData } from "user/hooks/useUserData";

const SaveButton = ({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} variant="primary" size="medium">
    保存
  </Button>
);

interface PluginToggleProps {
  label: string;
  isEnabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PluginToggle: React.FC<PluginToggleProps> = ({
  label,
  isEnabled,
  onChange,
}) => {
  return (
    <Toggle
      label={label}
      id={label.replace(/ /g, "-").toLowerCase()}
      checked={isEnabled}
      onChange={onChange}
    />
  );
};

const PluginSettings = () => {
  const customId = "pluginSettings";
  const data = useUserData(customId);
  const [plugins, setPlugins] = useState({
    aiEnabled: data?.aiEnabled || false,
    financeEnabled: data?.financeEnabled || false,
    roomManagementEnabled: data?.roomManagementEnabled || false, // 新增
  });
  const [error, setError] = useState<string | null>(null);

  const handleToggleChange =
    (pluginKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPlugins({
        ...plugins,
        [pluginKey]: event.target.checked,
      });
    };

  const handleSaveClick = async () => {
    try {
      const dataToSave = plugins;
      const flags = { isJSON: true };
      await saveData(dataToSave, customId, flags);
      setError(null);
    } catch (error) {
      console.error("保存失败:", error);
      setError("保存失败");
    }
  };

  return (
    <div>
      <PluginToggle
        label="AI插件"
        isEnabled={plugins.aiEnabled}
        onChange={handleToggleChange("aiEnabled")}
      />
      <PluginToggle
        label="个人财务管理插件"
        isEnabled={plugins.financeEnabled}
        onChange={handleToggleChange("financeEnabled")}
      />
      <PluginToggle // 新增
        label="房间管理插件"
        isEnabled={plugins.roomManagementEnabled}
        onChange={handleToggleChange("roomManagementEnabled")}
      />
      <SaveButton onClick={handleSaveClick} />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default PluginSettings;
