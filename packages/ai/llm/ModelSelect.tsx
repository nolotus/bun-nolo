// ModelSelector.tsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryData } from "app/hooks/useQueryData";
import { modelEnum } from "ai/llm/models";
import { FormField, Label, Select } from "render/CommonFormComponents";
import { useAuth } from "auth/useAuth";
import { DataType } from "create/types";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { data: llmData, isLoading } = useQueryData({
    queryUserId: auth.user?.userId,
    options: {
      isJSON: true,
      limit: 100,
      condition: {
        type: DataType.LLM,
      },
    },
  });

  const modelOptions = useMemo(() => {
    const predefinedOptions = Object.entries(modelEnum).map(([key, value]) => ({
      value: `predefined:${value}`,
      label: key,
    }));

    const userLLMOptions = llmData
      ? llmData.map((llm: any) => ({
          value: `user:${llm.id}`,
          label: `${llm.name} (${llm.model})`,
        }))
      : [];

    return [
      { label: t("predefinedModels"), options: predefinedOptions },
      { label: t("userLLMs"), options: userLLMOptions },
    ];
  }, [llmData, t]);

  return (
    <FormField>
      <Label htmlFor="model">{t("model")}:</Label>
      <Select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
      >
        <option value="">{t("selectModel")}</option>
        {modelOptions.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </FormField>
  );
};

export default ModelSelector;
