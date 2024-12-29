import { CheckIcon, } from "@primer/octicons-react";
import { useEffect, useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { FormField } from "render/form/FormField";
import { Label } from "render/form/Label";

import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";
import Select from "./Select";

interface ModelSelectorProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  theme?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  register,
  setValue,
  watch,
  errors,
}) => {
  const { t } = useTranslation("ai");
  const provider = watch("provider");
  const [models, setModels] = useState<Model[]>([]);
  const [providerInputValue, setProviderInputValue] = useState<string>(
    provider || "",
  );

  useEffect(() => {
    setProviderInputValue(provider || "");
  }, [provider]);

  useEffect(() => {
    const modelsList = getModelsByProvider(providerInputValue);
    setModels(modelsList);
    if (modelsList.length > 0) {
      setValue("model", modelsList[0].name);
    }
  }, [providerInputValue, setValue]);

  const renderError = (field: string) => {
    return errors[field] ? (
      <div style={{ color: "red", marginTop: "4px", fontSize: "12px" }}>
        {errors[field].message}
      </div>
    ) : null;
  };

  const sharedModelSelectorContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  };

  return (
    <>
      <div style={sharedModelSelectorContainerStyle}>
        <FormField>
          <Label>{t("provider")}</Label>
          <Select
            items={providerOptions.map((item) => ({ name: item }))}
            selectedItem={provider ? { name: provider } : undefined}
            onSelectedItemChange={(item) => {
              setValue("provider", item.name);
              setProviderInputValue(item.name);
            }}
            itemToString={(item) => (item ? item.name : "")}
            placeholder={t("selectProvider")}
            allowInput={true}
            onInputChange={(value) => setProviderInputValue(value)}
          />
          {renderError("provider")}
        </FormField>

        <FormField>
          <Label>{t("model")}</Label>
          <Select
            items={models}
            selectedItem={models.find((model) => watch("model") === model.name)}
            onSelectedItemChange={(item) => setValue("model", item.name)}
            itemToString={(item) => (item ? item.name : "")}
            renderOptionContent={(item, isHighlighted, isSelected) => (
              <div className="model-option">
                <span className="model-name">{item.name}</span>
                <div className="model-indicators">
                  {item.hasVision && (
                    <span className="vision-badge">{t("supportsVision")}</span>
                  )}
                  {isSelected && <CheckIcon size={16} className="check-icon" />}
                </div>
              </div>
            )}
            placeholder={t("selectModel")}
          />
          {renderError("model")}
        </FormField>
      </div>
    </>
  );
};

export default ModelSelector;
